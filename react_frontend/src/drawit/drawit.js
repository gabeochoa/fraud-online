import React, { Component } from "react";
import ReactDOM from 'react-dom';
import autobind from "autobind-decorator";
import CreateGame from '../components/CreateGame';
import JoinGame from '../components/JoinGame';
import Home from '../components/Home';
import Menu from '../components/Menu';
import Lobby from '../components/Lobby';
import DrawingCanvas from './drawingCanvas';
import "./drawit.css";


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


  changeTimer(new_time){
    this.setState({
      seconds: new_time
    })
  }

  changeLocation(newLocation, changeRoom){
    console.log("got room " + room + " " + newLocation);
    this.setState({
      location_state: newLocation,
    }, changeRoom);
  }

  render_header(){
    return (
      <React.Fragment>
        <div className="div_set">
          <h4 style={{fontSize: 30}}> <Icon path={mdiPen} size={1.5}/> 
            Draw My Meme! <sup style={{color: "red", fontSize: 12}}>Beta</sup>
          </h4>
          <hr className="hrstyle" />
        </div>
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
      />
    );

    let join_jsx = (
      <JoinGame
        room_code=""
        changeLocation={()=>{}}
      />
    );

    let game_jsx = (
      <DrawingCanvas
        seconds={this.state.seconds}
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
      <div style={top_level}>
        <Menu
          starting_location="home"
          all_locations={location_data}
          header={this.render_header()}
          footer={<p></p>}
          />
      </div>
    );
  }
}

const top_level = {
  display: "block", 
  justifyContent: "center",
  margin: "auto",
  top: "0",
  width: "100%",
  height: "100%",
}

const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<DrawItApp />, wrapper) : null;