import React, { Component } from "react";
import windowSize from '../components/windowSize';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import Button from '@material-ui/core/Button';
import autobind from 'autobind-decorator'

import Icon from "@mdi/react";
import { mdiPencil, mdiEraser, mdiClose, mdiConsoleLine, mdiCalculator } from "@mdi/js";
import { GithubPicker, SliderPicker, HuePicker, CustomPicker, ChromePicker} from 'react-color';
import {rainbow} from './utils';
import VerticalSlider from '../components/VerticalSlider';
import SweetAlert from 'react-bootstrap-sweetalert';
import "../components/menu.css";
import "./drawit.css";
import TooledTouchableCanvas from "../components/TooledTouchableCanvas";

const BACKGROUND = 'white'

const COLOR_CHOICES = ['black', '#C0C0C0', 'white', '#B80000', '#DB3E00', '#FCCB00', '#008B02', '#006B76', '#1273DE', '#004DCF', '#5300EB',
'#EB9694', '#FAD0C3', '#FEF3BD', '#C1E1C5', '#8B4513'];//'#BED3F3', '#D4C4FB'];

const CLEAR = "__CLEAR"

let PENCIL = {
  name: "PENCIL",
  stroke: COLOR_CHOICES[0],
  lineWidth: 10,
}

const ERASER = {
  name: "ERASE",
  stroke: BACKGROUND,
  lineWidth: 15,
}


let CANVAS = {
  width: 1000,
  height: 1000
}

@autobind
class BottomGameButtons extends Component{
    constructor(props){
        super(props);
        //current_artist, kill_websocket, changeLocation, clearGameState, send_message
        this.state = {
            confirm_box: null,
        }
    }

    onClickStringHandler(button_){
        switch(button_){
            case "end_round":
                if(this.props.current_artist != undefined){
                    this.props.send_message({
                        command: "end_round"
                    })
                }
            break;
            case "end_game":
                if(this.props.current_artist != undefined){
                    this.props.send_message({
                        command: "end_game"
                    })
                    this.props.changeLocation("lobby");
                }
            break;
            case "exit_room":
                this.props.kill_websocket(this.props.username);
                this.props.changeLocation("home");
                this.props.clearGameState();
            break;
            default: 
                console.log("button clicked but not handled", button_);
            break;
        }
    }

    closeConfirmBox(){
        this.setState({confirm_box: null})
    }

    onClickHandler(event){
        if (event.target == this.canvas) {
            event.preventDefault();
        }
          
        console.log("click event", event, event.target)

        while(event.target.getAttribute("name") === null){
            event.target = event.target.parentNode;
        }
        const button_ = event.target.getAttribute("name");
        const confirm_text = event.target.getAttribute("confirm_text");
        this.setState({
            confirm_box: (
                <SweetAlert
                    warning
                    showCancel
                    confirmBtnText={"Yes"}
                    confirmBtnBsStyle="warning"
                    cancelBtnBsStyle="default"
                    title="Are you sure?"
                    onConfirm={() => { this.onClickStringHandler(button_); this.closeConfirmBox() }}
                    onCancel={ () => {this.closeConfirmBox()}}
                    closeOnClickOutside={true}
                    >
                    {confirm_text}
                </SweetAlert>
            ),
        });
    }

    render(){
        return (
            <React.Fragment>
            {this.state.confirm_box != null && this.state.confirm_box}
            <div style={room_button_holder} className="button_font">
                <Button variant="contained" 
                    name="end_round" 
                    confirm_text="Really end round?"
                    onClick={this.onClickHandler} style={room_button_style}>
                    Someone got it
                </Button>
                <Button variant="contained" name="end_game" 
                    confirm_text="Really end game?"
                    onClick={this.onClickHandler} style={room_button_style}>
                    End Game
                </Button>
                <Button variant="contained" name="exit_room" 
                    confirm_text="Really exit room?"
                    onClick={this.onClickHandler} style={room_button_style}>
                    Leave Game
                </Button>
            </div>
            </React.Fragment>
        );
    }
}

@autobind
class DrawingCanvas extends Component {
    constructor(props) {
      super(props);

      this.state = {
        is_loading: true,
        in_lobby: false,
        current_artist: null,
        is_local_player_artist: false,
      }
    //   this.numOfSteps = 10 // this would be set to num of players
    //   this.player_colors = {}

      this.touchable_canvas = React.createRef();
    }

    componentDidMount(){
        this.props.register_socket_callbacks("drawingCanvas", "onmessage", this.process_message)
        this.props.send_message({ command: 'get_room' });
    }

    componentWillUnmount(){ 
        this.props.unregister_socket_callbacks("drawingCanvas", "onmessage")
    }

    setTouchableRef(tref){
        this.touchable_canvas = tref;
    }

    end_round(data, sender){
      this.touchable_canvas.clear_canvas(false);
      console.log("end round", data, sender)
      if(data.current_player >= data.players.length){
        // ran out of players
        this.props.send_message({
            command: "end_game"
        })
        return;
      }

      console.log("end_roundish", data.players, data.current_player)
      const player = data.players[data.current_player]

      this.setState({
        current_artist: player,
        is_local_player_artist: (player.channel == sender)
      })
    }

    process_message(parsedData) {
        console.log("drawing canvas process message", parsedData)

        // dont care what message, just "done loading"
        if(this.state.is_loading){
            this.setState({
                is_loading: false
            })
        }

        const command = parsedData.command;
        const username = parsedData.message.username;
        const sender = parsedData.sender;

        if(command == "get_room_response"){
            let players = parsedData.message.players;
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

            this.setState({
                confirm_box: null
            })
            this.props.updateGameStarted(false);
            this.props.changeLocation("_back");
        }

        // console.log(username, this.player_colors)

        if(command == "draw"){

            if(parsedData.message.tool == CLEAR){
                this.touchable_canvas.clear_canvas(false);
                return; 
            }

            // if(!(username in this.player_colors))
            // {
            //   // console.log("choosing new color")
            //   var new_color = rainbow(this.numOfSteps, Object.keys(this.player_colors).length);
            //   this.player_colors[username] = new_color
            // }

            let prev = parsedData.message.prev;
            let cur = parsedData.message.cur;
            let tool = parsedData.message.tool;
            this.touchable_canvas.upscale_paint(prev, cur, tool)
        }
    }

    onClickStringHandler(button_){
      switch(button_){
        case "end_round":
          if(this.state.current_artist != undefined){
            this.props.send_message({
              command: "end_round"
            })
          }
        break;
        case "end_game":
          if(this.state.current_artist != undefined){
            this.props.send_message({
              command: "end_game"
            })
            this.props.changeLocation("lobby");
          }
        break;
        case "exit_room":
          this.props.kill_websocket(this.props.username);
          this.props.changeLocation("home");
          this.props.clearGameState();
        break;
        default:
          console.log("button clicked but no handler", button_)
        break;
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

      if(event.target.getAttribute("is_confirm") != "true"){
        return this.onClickStringHandler(button_);
      }

      const confirm_text = event.target.getAttribute("confirm_text");
      console.log("confirm text still getting called", confirm_text)
    }

    componentWillUnmount() {
      clearAllBodyScrollLocks();
      this.props.unregister_socket_callbacks("drawingCanvas", "onmessage")
    }

    render_text(text){
      return (
        <div style={{position: "inherit", display: "block", left: 40, margin: 3}}>
          <h1 style={{color: '#4a4a4a'}}>
            {text}
          </h1>
        </div>
      );
    }

    render_player_text(){
      return this.render_text(this.state.current_artist.username + " is drawing")
    }

    render_word_text(){
      return this.render_text(this.state.current_artist.word);
    }

    render_bottom_buttons(){
      return (
        <BottomGameButtons
            current_artist={this.state.current_artist}
            kill_websocket={this.props.kill_websocket}
            changeLocation={this.props.changeLocation}
            send_message={this.props.send_message}
            clearGameState={this.props.clearGameState}
        />
      );
    }

    render_artist_ui(){
      if(this.state.is_local_player_artist){
        return (
          <React.Fragment>
            {this.render_word_text() }
          </React.Fragment>
        );
      }
      else if(this.state.current_artist != undefined){
        return (
          <React.Fragment>
            {this.render_player_text() }
          </React.Fragment>
        );
      }
      else{
        console.log(this.state.current_artist, this.state.is_local_player_artist)
        return (
          <React.Fragment>
            {this.render_text("Loading...")}
          </React.Fragment>
        );
      }

    }

    render() {

      let is_artist_ui = this.render_artist_ui();
      return (
        <React.Fragment>
        {is_artist_ui}
        {this.render_bottom_buttons()}
        <TooledTouchableCanvas
          ref={this.setTouchableRef}
          is_local_player_artist={this.state.is_local_player_artist}
          send_message={this.props.send_message}
        />
        </React.Fragment>
      );
    }
  }

export default windowSize(DrawingCanvas);


const room_button_holder = {
    position: "absolute",
    left: 0,
    bottom: "2em",
    width: "100%",
}
const room_button_style = {
    touchAction: "auto",
    pointerEvents: "auto",
    width: "23.33%",
    margin: "5px",
    maxWidth: "150px",
    boxSizing:"border-box",
    fontSize: "0.75em",
}
