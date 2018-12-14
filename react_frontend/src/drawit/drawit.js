import React, { Component } from "react";
import ReactDOM from 'react-dom';
import GameWrapper from './gameWrapper';
import MenuButtonBar from "./menu";
import autobind from "autobind-decorator";
import CreateGame from '../components/CreateGame';
import JoinGame from '../components/JoinGame';
import Home from '../components/Home';
import Menu from '../components/Menu';
import Lobby from '../components/Lobby';

import 'lodash';

import Icon from '@mdi/react'
import { mdiPen } from '@mdi/js'

@autobind
class DrawItApp extends Component {

  constructor(props){
    super(props)

    this.state = {
      is_guessing: true,
      in_game: false,
      word: "penguin",
      location_state: "menu",
      room_code: "",
      username: "",
      people: [],
      seconds: 90
    }
  }

  get_random_word(){ 
    let memes = [
    "Surprised Pikachu",
    "Distracted Boyfriend",
    "Two Buttons",
    "Mocking Spongebob",
    "Expanding Brain",
    "Batman Slapping Robin",
    "Left Exit 12 Off Ramp",
    "Roll Safe Think About It",
    "Blank Nut Button",
    "Waiting Skeleton",
    "Is This A Pigeon",
    "Boardroom Meeting Suggestion",
    "One Does Not Simply",
    "Inhaling Seagull",
    "Hide the Pain Harold",
    "Ancient Aliens",
    "The Most Interesting Man In The World",
    "Futurama Fry",
    "Oprah You Get A",
    "Trump Bill Signing",
    "The Rock Driving",
    "Disaster Girl",
    "Evil Kermit",
    "Brace Yourselves X is Coming",
    "Bad Luck Brian",
    "Leonardo Dicaprio Cheers",
    "Y U No",
    "Black Girl Wat",
    "Who Would Win?",
    "But Thats None Of My Business",
    "First World Problems",
    "Creepy Condescending Wonka",
    "X All The Y",
    ]
    return _.sample(memes);
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

  changeRoomCode(room_code, callback){
    this.setState({
      room_code: room_code,
    },
    this.callback)
  }

  changeLocation(newLocation, changeRoom){
    // console.log("got room " + room + " " + newLocation);
    this.setState({
      location_state: newLocation,
    }, changeRoom);
  }

  render_header(){
    return (
      // <div id="button_bar" className="field is-centered button_bar_style">
      //   <h4 style={{fontSize: 30}}> <Icon path={mdiPen} size={1.5}/> Draw It!</h4>
      //   <hr className="hrstyle" />
      // </div>
      <React.Fragment>
        <h4 style={{fontSize: 30}}> <Icon path={mdiPen} size={1.5}/> Draw It!</h4>
        <hr className="hrstyle" />
      </React.Fragment>
    );
  }

  render(){
    let home_jsx = (
      <Home
        changeLocation={()=>{}}
      />
    );
    let lobby_jsx = (
      <Lobby
        room_code="testtest"
        is_game_started={false}
        players={[]} 
        changeLocation={()=>{}}
      />
    );

    let create_jsx = (
      <CreateGame
        changeLocation={()=>{}}
        changeUsername={this.changeUsername}
      />
    );

    let join_jsx = (
      <JoinGame
        room_code=""
        changeLocation={()=>{}}
        changeUsername={this.changeUsername}
        changeRoomCode={this.changeRoomCode}
      />
    );

    let first_word = this.get_random_word();
    let game_jsx = (
      <GameWrapper
        room={this.state.room_code}
        username={this.state.username}
        seconds={this.state.seconds}
        word={first_word}
      /> 
    );

    var location_data = {
      home: home_jsx,
      lobby: lobby_jsx,
      create: create_jsx,
      join: join_jsx,
      game: game_jsx,
    }

    return (
      <Menu
        starting_location="home"
        all_locations={location_data}
        header={this.render_header()}
        footer={<p></p>}
        />
    );
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