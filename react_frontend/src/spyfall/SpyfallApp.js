import React, { Component } from "react";
import ReactDOM from "react-dom";
import Container from "../components/Container";
import MenuButtonBar from "./menu";
import SpyfallGameParent from "./playing";

class SpyfallApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      minutes: 5,
      username: "",
      room: "", 
      location_state: "menu",
      people: [               
        {
            id: 1,
            name: "me",
            is_me: true,
        },
        {
            id: 2,
            name: "not me",
            is_me: false
        },
        {
            id: 3,
            name: "also not me",
            is_me: false
        },
        {
            id: 4,
            name: "might be me",
            is_me: false
        },
    ],

    };

    this.changeUsername = this.changeUsername.bind(this);
    this.changeLocation = this.changeLocation.bind(this);
    this.changeTimer = this.changeTimer.bind(this);
  }

  changeTimer(new_time){
    this.setState({
      minutes: new_time
    })
  }

  changeUsername(username, callback){
    this.setState({
      username: username,
    },
    this.callback)
  }

  changeLocation(room, newLocation, changeRoom){
    console.log("got room " + room + " " + newLocation);
    this.setState({
      room: room, 
      location_state: newLocation,
    }, changeRoom);
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
       changeTimer={this.changeTimer}
       />
    );
    switch(this.state.location_state){
      case "menu":
        content = content;
        break;
      case "waiting":
      case "game":
        content = <SpyfallGameParent
                   room={this.state.room}
                   username={this.state.username}
                   changeLocation={this.changeLocation}
                   waitForSocket={this.waitForSocket}
                   minutes={this.state.minutes}
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