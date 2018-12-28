import React, { Component } from "react";
import windowSize from '../components/windowSize';
import { clearAllBodyScrollLocks } from 'body-scroll-lock';
import autobind from 'autobind-decorator'
import "../components/menu.css";
import "./drawit.css";
import TooledTouchableCanvas from "../components/TooledTouchableCanvas";
import BottomGameButtons from '../components/BottomGameButtons';



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

      this.touchable_canvas = React.createRef();
      this.bottom_buttons = React.createRef();
    }

    componentDidMount(){
        this.props.register_socket_callbacks("drawingCanvas", "onmessage", this.process_message)
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
      this.touchable_canvas.clear_canvas(false);
    //   console.log("end round", data, sender)
      if(data.current_player >= data.players.length){
        // ran out of players
        this.props.send_message({
            command: "end_game"
        })
        return;
      }

    //   console.log("end_roundish", data.players, data.current_player)
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
            this.bottom_buttons.closeConfirmBox();
            this.props.updateGameStarted(false);
            this.props.changeLocation("_back");
        }
        if(command == "draw"){
          this.touchable_canvas.upscale_paint(parsedData.message.prev, 
                                              parsedData.message.cur, 
                                              parsedData.message.tool)
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
            ref={this.setBottomRef}
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
