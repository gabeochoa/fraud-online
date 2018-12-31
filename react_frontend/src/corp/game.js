import React, { Component } from "react";
import autobind from 'autobind-decorator'

const CALLBACK_NAME = "corp_game";

@autobind
class Game extends Component {
    constructor(props) {
      super(props);

      this.state = {
      }

      this.props.update_websocket("fakeroom", {username: "yeyeye"})
      this.props.register_socket_callbacks(CALLBACK_NAME, "onopen", this.on_open_handler);
      this.props.register_socket_callbacks(CALLBACK_NAME, "onmessage", this.process_message);
    }

    componentDidMount(){
        this.on_open_handler();
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

        console.log("message", command, message, username, sender)

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
            <div style={{textAlign:"center"}}>
                <a name="room_end" className="button is-outlined button_style"
                    onClick={this.onClickHandler}>End Game</a>           
                <a name="room_leave" className="button is-outlined button_style" 
                    onClick={this.onClickHandler}>Leave Game</a>
            </div>
        </React.Fragment>
      );
    }
  }
  export default Game;