import React, { Component } from "react";
import ReactDOM from "react-dom";
import Container from "../components/Container";
import MenuButtonBar from "./menu";
import SpyfallWaitingRoom from "./room";
import SpyfallGame from "./playing";

import WebSocketInstance from '../components/WebSocket';

class SpyfallApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      room: "", 
      location_state: "menu",
    };

    this.changeUsername = this.changeUsername.bind(this);
    this.changeLocation = this.changeLocation.bind(this);
  }

  changeUsername(username){
    this.setState({
      username: username,
    })
  }

  changeLocation(room, newLocation){
    console.log("got room " + room + " " + newLocation);
    this.setState({
      room: room, 
      location_state: newLocation,
    });
    // dont try to connect to empty room 
    if(room == ""){
      return 
    }
    WebSocketInstance.connect(room);
    WebSocketInstance.initChatUser(this.state.username);
  }

  render() {
    let menu_location = this.state.username != ""? "join": "home";

    let content = (
      <MenuButtonBar
       changeLocation={this.changeLocation}
       changeUsername={this.changeUsername}
       start_location={menu_location}
       username={this.state.username}
       room={this.state.room}
       />
    );
    switch(this.state.location_state){
      case "menu":
        content = content;
        break;
      case "waiting":
        content = <SpyfallWaitingRoom 
                   access_code={this.state.room}
                   username={this.state.username}
                   changeLocation={this.changeLocation}
                   />
        break;
      case "game":
        content = <SpyfallGame
                   access_code={this.state.room}
                   username={this.state.username}
                   changeLocation={this.changeLocation}
                  /> 
        break;
      default:
        content = content;
        break;
    }
    return (
      <Container>
        {content}
      </Container>
    )
  }
}

const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<SpyfallApp />, wrapper) : null;