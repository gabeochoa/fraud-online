import React, { Component } from "react";
import windowSize from '../components/windowSize';
import { enableBodyScroll, disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import autobind from 'autobind-decorator'
import "../components/menu.css";
import "../drawit/drawit.css";
import TooledTouchableCanvas from "../components/TooledTouchableCanvas";
import BottomBar from './BottomBar';
import { Button } from "@material-ui/core";
import { mdiMapMarker, mdiToolbox, mdiBorderAll } from "@mdi/js";
import Icon from '@mdi/react'
import SweetAlert from "react-bootstrap-sweetalert/lib/dist/SweetAlert";

const column_list = {
    columnCount: 2,
    columnGap: "3px",
    columnRuleColor: "white",
    columnRuleStyle: "solid",
    columnRuleWidth: "10px",
}
const column_list_item = {
    padding: "0 0 0 10px",
    margin: "0 0 4px 0",
    backgroundColor: "#f0f0f0",
    columnSpan: "1",
    wordWrap: "break-word",
}

function pretty_location(location){
    if(location == null || location == undefined || location == ""){return location;}
    
    return (
        location
        .split("_")
        .map(   (item) => {
            return item.charAt(0).toUpperCase() + item.slice(1);
        })
        .join(" ")
    );
}


@autobind
class LocationReference extends Component{
    constructor(props){
        super(props);
    }

    renderPlace(place){
        let place_text = null;
        if(place[1]){
            place_text =  <p style={{color: "#bbb", textDecoration: "line-through"}}> {pretty_location(place[0])} </p>
        }
        else{
            place_text = <p> {pretty_location(place[0])} </p>
        }
        return (<li key={place[0]} name={place[0]} onClick={this.props.handleClickLocation} style={column_list_item}>
                    {place_text}
                </li>);
    }

    render_locations(){
        return (
            <React.Fragment>
            <ul style={column_list}>
                {this.props.locations.map( (place) => this.renderPlace(place))}
            </ul>
            </React.Fragment>
        );
    }

    render(){
        if(this.props.show_modal){
            return (
                
                <SweetAlert
                    title={"Locations"}
                    style={{
                        // top: "-1em",
                        position: "absolute",
                        overflowY: "scroll",
                        top: "45%",
                        touchAction: "auto",
                        pointerEvents: "auto",
                    }}
                    confirmBtnText={"close locations"}
                    onConfirm={this.props.onConfirm}
                    onCancel={this.props.onConfirm}

                >
                    {this.render_locations()}
                </SweetAlert>
            );
        }
        return (<React.Fragment></React.Fragment>);
    }
}

@autobind
class FakeArtistCanvas extends Component {
    constructor(props) {
      super(props);

      this.state = {
        is_loading: true,
        in_lobby: false,
        current_artist: null,
        is_local_player_artist: false,
        hideButtonState: [
            true, 
            true, 
            true
        ],
        locations: [],
        show_location_modal: false,
      }


      this.props.update_websocket("defaultroom");

      this.touchable_canvas = React.createRef();
      this.bottom_buttons = React.createRef();
    }

    componentDidMount(){
        this.props.register_socket_callbacks("drawingCanvas", "onmessage", this.process_message)
        this.props.send_message({ command: 'start_game' });
        this.props.send_message({ command: 'get_room' });
    }

    componentWillUnmount() {
      clearAllBodyScrollLocks();
      this.props.unregister_socket_callbacks("drawingCanvas", "onmessage")
    }

    setTouchableRef(tref){
        this.touchable_canvas = tref;
    }

    setBottomRef(tref){
        this.bottom_buttons = tref;
    }

    end_round(data, sender){
        // console.log("end round", data, sender)
        if(data.round >= (this.props.game_options.rounds-1)){
        // ran out of players
            this.props.send_message({
                command: "end_game"
            })
            return;
        }

        // console.log("end_roundish", data.players, data.current_player)
        const player = data.players[data.current_player] || data.players[0];

        this.setState({
            current_artist: player,
            is_local_player_artist: (player.channel == sender),
            hideButtonState: [
                    (player.channel == sender), 
                    true,
                    true, 
                ],
        })
    }

    process_message(parsedData) {
        // console.log("drawing canvas process message", parsedData)

        // dont care what message, just "done loading"
        if(this.state.is_loading){
            this.setState({
                is_loading: false
            })
        }

        const command = parsedData.command;
        const username = parsedData.message.username;
        const sender = parsedData.sender;

        let players = parsedData.message.players;
        if(players){
            players.forEach(
                (item) => {
                    if(item.channel == sender){
                        item.is_me = true;
                    }
                }
            );
            const is_game_started = parsedData.message.is_game_started;
            this.props.updatePlayers(players);
            this.props.updateGameStarted(is_game_started);
        }

        if(parsedData.message.locations){
            let locations = this.state.locations;
            if(locations.length == 0){
                locations = [...parsedData.message.locations].map((item)=>{return [item, false]}) 
                
            }
            this.setState({
                locations: locations,
            })
        }

        if(command == "get_room_response"){
            this.end_round(parsedData.message, sender)
        }

        if(command == "start_game"){
            // start of game is kinda like switching rounds
            
            this.end_round(parsedData.message, sender)
        }
        if(command == "end_round"){
            this.end_round(parsedData.message, sender)
        }

        if(command == "end_game"){
            this.touchable_canvas.clear_canvas(false);
            this.bottom_buttons.closeConfirmBox();
            this.props.updateGameStarted(false);
            this.props.changeLocation("_back");
        }
        if(command == "draw"){
            // TODO move to paint or something 
            if(parsedData.message.tool == "_CLEAR"){
                this.touchable_canvas.clear_canvas(false);
                return; 
            }
            this.touchable_canvas.upscale_paint(parsedData.message.prev, 
                                                parsedData.message.cur, 
                                                parsedData.message.tool)
        }
    }

    onClickHandler(event){
        if (event.target == this.canvas) {
            event.preventDefault();
        }
        
        // console.log("click event", event, event.target)
        while(event.target.getAttribute("name") === null){
            event.target = event.target.parentNode;
        }
        const button_ = event.target.getAttribute("name");
        // console.log(button_, "was clicked")
        switch(button_){
            case "mapmarker":
                this.openLocationReference()
            break;
            case "toolbox":
                this.closeLocationReference()
            break;
            default:
            break;
        }
    }

    disableSingleScrollLock(element){
        element.style.position = "static";
        element.style.overflow = "scroll";
    }
    disableGlobalScrollLock(){
        this.disableSingleScrollLock(document.body)
    }

    enableSingleScrollLock(element){
        element.style.position = "fixed";
        element.style.overflow = "hidden";
    }
    enableGlobalScrollLock(){
        this.enableSingleScrollLock(document.body)
    }

    openLocationReference(){
        this.disableGlobalScrollLock();
        this.setState({
            show_location_modal: true,
        })
    }
    closeLocationReference(){
        this.enableGlobalScrollLock();
        document.body.scrollTop = 0;
        this.setState({
            show_location_modal: false
        })
    }


    handleClickLocation(event){
        while(event.target.getAttribute("name") === null){
            event.target = event.target.parentNode;
        }
        // console.log( event.target.getAttribute("name"), "was clicked")

        const locations = [...this.state.locations]//this.props.extra_game_state.locations]
        // // find the matching object
        const location = locations.filter(c => c[0] == event.target.getAttribute("name"))[0];
        // // index in our list 
        const index = locations.indexOf(location);
        locations[index] = [location[0], !location[1]];
        
        this.setState({
            locations: locations
        })
        // this.props.set_extra_game_state("locations", locations);
    }

    render_text(text){
      return (
        <div style={{position: "inherit", display: "-webkit-inline-box", left: 40, margin: 3}}>
            <h1 style={{color: '#4a4a4a'}}>
                {pretty_location(text)}
            </h1>
            <Button 
                name="mapmarker"
                onClick={this.onClickHandler}
                style={{
                    top: "-0.75em",
                    margin: 0,
                    padding: 0,
                }}
            > 
                <Icon path={mdiMapMarker} size={"1em"}/> 
            </Button>
        </div>
      );
    }

    render_player_text(){
      return this.render_text(this.state.current_artist.username + " is drawing")
    }

    render_word_text(){
      return this.render_text("The location is: " + this.state.current_artist.location);
    }

    render_bottom_buttons(){
      return (
        <BottomBar
            ref={this.setBottomRef}
            current_artist={this.state.current_artist}
            kill_websocket={this.props.kill_websocket}
            changeLocation={this.props.changeLocation}
            send_message={this.props.send_message}
            clearGameState={this.props.clearGameState}
            hideState={this.state.hideButtonState}
        />
      );
    }

    render_artist_ui(){
        if(this.state.current_artist == null){
            return (
                <React.Fragment>
                  {this.render_text("Loading...")}
                </React.Fragment>
              );
        }
        if(this.state.current_artist.is_me){
            // im drawing; either i know the location or im the spy
            if(this.state.current_artist.is_spy){
                return (
                    <React.Fragment>
                        {this.render_text("You are the spy :)") }
                    </React.Fragment>
                );
            }
            else{
                return (
                    <React.Fragment>
                        {this.render_word_text() }
                    </React.Fragment>
                );
            }
        }
        else{
            // im not drawing, so lets just say someone else is 
            return (
                <React.Fragment>
                    {this.render_player_text() }
                </React.Fragment>
            );
        }
    }

    render() {
      return (
        <React.Fragment>
        {/* <Timer total_time={this.state.total_time}/> */}
        {this.state.location_modal}
        <LocationReference
            show_modal={this.state.show_location_modal}
            locations={this.state.locations}
            onConfirm={this.closeLocationReference}
            handleClickLocation={this.handleClickLocation}
        />
        {this.render_artist_ui()}
        {this.render_bottom_buttons()}
        <TooledTouchableCanvas
          ref={this.setTouchableRef}
          is_local_player_artist={this.state.is_local_player_artist}
          send_message={this.props.send_message}
          hideClearButton={true}
        />
        </React.Fragment>
      );
    }
  }

export default windowSize(FakeArtistCanvas);
