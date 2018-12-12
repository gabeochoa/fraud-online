import React, { Component } from "react";
import ReactDOM from 'react-dom';
import GameWrapper from './gameWrapper';
import MenuButtonBar from "./menu";
import autobind from "autobind-decorator";

@autobind
class DrawItApp extends Component {

  constructor(props){
    super(props)

    this.state = {
      is_guessing: true,
      in_game: false,
      word: "penguin",
      location_state: "menu",
      room: "",
      username: "",
      people: [],
      seconds: 90
    }
  }

  changeTimer(new_time){
    this.setState({
      seconds: new_time
    })
  }

  changeUsername(username, callback){
    this.setState({
      username: username,
    },
    this.callback)
  }

  changeLocation(room, newLocation, changeRoom){
    // console.log("got room " + room + " " + newLocation);
    this.setState({
      room: room, 
      location_state: newLocation,
    }, changeRoom);
  }

  render(){
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
        content = <GameWrapper
                   room={this.state.room}
                   username={this.state.username}
                   changeLocation={this.changeLocation}
                   seconds={this.state.seconds}
                  /> 
        break;
      default:
        content = content;
        break;
    }

    return (
      <React.Fragment>
      {content}
      </React.Fragment>
    );

    // if(this.state.in_game){
    //   if(this.state.is_guessing){
    //     return (
    //       <GuessingCanvas
    //       width={document.width}
    //       height={document.height}
    //       word_length={this.state.word.length}
    //       />
    //     )
    //   }
    //   else{
    //   return (
    //     <DrawingCanvas
    //       width= {document.width}
    //       height= {document.height}
    //       word={this.state.word}
    //     />
    //   );
    //   }
    // }else{
    //   return (<MenuButtonBar
    //   />
    //   );
    // }
  }
}


const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<DrawItApp />, wrapper) : null;