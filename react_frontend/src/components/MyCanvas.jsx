import React, { Component } from "react";
import windowSize from '../components/windowSize';
import {clearAllBodyScrollLocks } from 'body-scroll-lock';
import Button from '@material-ui/core/Button';
import autobind from 'autobind-decorator';
import SweetAlert from 'react-bootstrap-sweetalert';
import "../components/menu.css";
import "../drawit/drawit.css";

import TooledTouchableCanvas from './TooledTouchableCanvas';

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
class MyCanvas extends Component {
    constructor(props) {
      super(props);

      this.state = {
        current_artist: null,
        is_local_player_artist: false,
      }

      this.bottom_buttons = React.createRef();
      this.tooled_canvas = React.createRef();
      
      this.props.update_websocket("fakeartist");

      this.player_colors = {}
    //   this.props.register_socket_callbacks("drawingCanvas", "onmessage", this.process_message)

      // why is this needed tho?
      // this.props.send_message({
      //   command: "start_game",
      // });

      this.props.send_message({ command: 'get_room' });
    }

    // end_round(data, sender){
    //   this.clear_canvas();
    //   this.bottom_buttons.closeConfirmBox();
    //   this.tooled_canvas.resetTools();
    //   // console.log("end round", data, sender)
    //   if(data.current_player >= data.players.length){
    //     // ran out of players
    //     this.props.send_message({
    //         command: "end_game"
    //     })
    //     return;
    //   }

    //   // console.log("end_roundish", data.players, data.current_player)
    //   const player = data.players[data.current_player]

    //   this.setState({
    //     current_artist: player,
    //     is_local_player_artist: (player.channel == sender)
    //   })
    // }

    // process_message(parsedData) {
    //   // console.log("drawing canvas process message", parsedData)
  
    //   // dont care what message, just "done loading"
    //   if(this.state.is_loading){
    //     this.setState({
    //       is_loading: false
    //     })
    //   }

    //   const command = parsedData.command;
    //   const username = parsedData.message.username;
    //   const sender = parsedData.sender;
      
    //   if(command == "start_game"){
    //     // start of game is kinda like switching rounds
    //     this.end_round(parsedData.message, sender)
    //   }
    //   if(command == "end_round"){
    //     this.end_round(parsedData.message, sender)
    //   }

    //   if(command == "end_game"){

    //     this.bottom_buttons.closeConfirmBox();
    //     this.props.updateGameStarted(false);
    //     this.props.changeLocation("_back");
    //   }

    //   // console.log(username, this.player_colors)

    //   if(command == "draw"){

    //     if(parsedData.message.tool == CLEAR){
    //       this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    //       return; 
    //     }
        
    //     if(!(username in this.player_colors))
    //     {
    //       // console.log("choosing new color")
    //       var new_color = rainbow(this.numOfSteps, Object.keys(this.player_colors).length);
    //       this.player_colors[username] = new_color
    //     }

    //     let upscaled_prev = {
    //         x: parsedData.message.prev.x * CANVAS.width,
    //         y: parsedData.message.prev.y * CANVAS.height,
    //     }
    //     let upscaled_cur = {
    //       x: parsedData.message.cur.x * CANVAS.width,
    //       y: parsedData.message.cur.y * CANVAS.height,
    //     }
    //     let upscaled_tool = {... parsedData.message.tool}
    //     upscaled_tool.lineWidth = Math.max(1, upscaled_tool.lineWidth * CANVAS.height);
    //     // console.log(upscaled_prev, upscaled_cur, upscaled_tool)
    //     this._paint( upscaled_prev, upscaled_cur, upscaled_tool)
    //   }
    // }


    componentDidMount(){
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
                {this.render_tools() }
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
            return (
                <React.Fragment>
                {this.render_text("Loading...")}
                </React.Fragment>
            );
        }

    }

    render() {
      // console.log(this.props);
      let is_artist_ui = this.render_artist_ui();
      
      return (
        <React.Fragment>
          {is_artist_ui}
          {this.render_bottom_buttons() }
          <TooledTouchableCanvas 
            is_local_player_artist={true}
            send_message={this.props.send_message}
          /> 
        </React.Fragment>
      );
    }
  }
  export default windowSize(MyCanvas);

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
