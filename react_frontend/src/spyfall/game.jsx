import React, { Component } from "react";
import autobind from 'autobind-decorator'
import Timer from '../components/Timer';


import "../drawit/drawit.css";
import "./spyfall.css";

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

@autobind
class _GameComp extends Component {
    constructor(props){
        super(props);
    }

    renderPlayer(person){
        if(person.role == null){return}
        let extra = <p></p>;
        if(person.is_first){
            extra = <sup style={{color:"red"}}> 1st</sup>
        }
        return (<li key={person.id} style={column_list_item}>
                    {person.username} {extra}
                </li>);
    }

    pretty_location(location){
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

    renderPlace(place){
        let place_text = null;
        if(place[1]){
            place_text =  <p style={{color: "#bbb", textDecoration: "line-through"}}> {this.pretty_location(place[0])} </p>
        }
        else{
            place_text = <p> {this.pretty_location(place[0])} </p>
        }
        return (<li key={place[0]} name={place[0]} onClick={this.props.handleClickLocation} style={column_list_item}>
                    {place_text}
                </li>);
    }

    renderRole(player){
        if(player.is_spy){
            return <p style={{textAlign:"center"}}> You are the {player.role} </p>
        }
        else{
            return (
                <React.Fragment>
                <p style={{textAlign:"center"}}>You are not the spy!</p>
                <p style={{textAlign:"center"}}>The location: {this.pretty_location(player.location)}</p>
                <p style={{textAlign:"center"}}>Your role: {player.role}</p>
                </React.Fragment>
            );
        }
    }

    renderGameHeader(){
        return (
            <div style={{textAlign:"center"}}>
                <Timer total_time={this.props.total_time}/>
                <hr className="hrstyle"/>
                {this.renderRole(this.props.player)}
            </div>
        );
    }

    renderGameButtons(){
        return (
            <div style={{textAlign:"center"}}>
                <a name="room_end" className="button is-outlined button_style"
                    onClick={this.props.handleClick}>End Game</a>           
                <a name="room_leave" className="button is-outlined button_style" 
                    onClick={this.props.handleClick}>Leave Game</a>
            </div>
        );
    }

    render(){
        return (
            <div>
                {this.renderGameHeader()}

                <hr className="hrstyle"/>

                <h4>Players:</h4>
                <ul style={column_list}>
                    {this.props.players.map( (person) => this.renderPlayer(person))}
                </ul>
                <h4>Location Reference: </h4>
                <ul style={column_list}>
                    {this.props.locations.map( (place) => this.renderPlace(place))}
                </ul>

                <hr className="hrstyle"/>

                {this.renderGameButtons()}
            </div>
        );
    }
}


const CALLBACK_NAME = "spyfall_game";

@autobind
class Game extends Component {
    constructor(props) {
      super(props);

      this.state = {
        is_loading: true,
      }

      this.props.register_socket_callbacks(CALLBACK_NAME, "onopen", this.on_open_handler);
      this.props.register_socket_callbacks(CALLBACK_NAME, "onmessage", this.process_message);

      this.props.set_extra_game_state("locations", []);
    }

    componentDidMount(){
      // why is this needed tho?
    //   this.props.send_message({
    //     command: "start_game"
    //   });
      // same here...
      this.props.send_message({ command: 'get_room' });
    }

    on_open_handler(event){
        this.props.send_message({ command: 'get_room' });
    }

    process_message(parsedData) {
        // dont care what message, just "done loading"
        if(this.state.is_loading){
            this.setState({
                is_loading: false
            })
        }

        const command = parsedData.command;
        const message = parsedData.message;
        const username = message.username;
        const sender = parsedData.sender;

        {
            let update_players = [...message.players]
            update_players.forEach((item)=>{
                if (item.channel == sender){
                    item.is_me = true;
                    this.setState({
                        player: item,
                    })
                }
                else{
                    item.is_me = false;
                }
            });

            let locations = [];
            if(message.locations){
                locations = [...message.locations].map((item)=>{return [item, false]})
            }

            this.props.updateGameStarted(message.is_game_started);
            this.props.updatePlayers(update_players);

            this.props.set_extra_game_state("locations", locations);
        }

        if(command == "end_game"){
            this.props.changeLocation("_back");
        }


    }

    handleClickLocation(event){
        while(event.target.getAttribute("name") === null){
            event.target = event.target.parentNode;
        }
        const locations = [...this.props.extra_game_state.locations]
        // // find the matching object
        const location = locations.filter(c => c[0] == event.target.getAttribute("name"))[0];
        // // index in our list 
        const index = locations.indexOf(location);
        locations[index] = [location[0], !location[1]];
        this.props.set_extra_game_state("locations", locations);
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

      console.log("button clicked", button_)
      switch(button_){
          case "room_leave":
            this.props.kill_websocket(this.props.username);
            this.props.changeLocation("home");
            this.props.clearGameState();
          break;
          case "room_end":
            this.props.send_message({
                command: "end_game"
            })
            this.props.changeLocation("lobby");
          break;
      }
    }

    componentWillUnmount() {
      this.props.unregister_socket_callbacks(CALLBACK_NAME, "onmessage")
    }

    render() {
      
      return (
        <React.Fragment>
            <_GameComp 
                player={this.state.player || {}} // TODO 
                locations={this.props.extra_game_state.locations || []}
                username= {this.props.username}
                players={this.props.players}
                handleClick={this.onClickHandler}
                handleClickLocation={this.handleClickLocation}
                total_time={this.props.game_options.timer}
            />
        </React.Fragment>
      );
    }
  }
  export default Game;