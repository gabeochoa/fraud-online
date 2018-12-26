import React, { Component } from "react";
import ReactDOM from 'react-dom';
import autobind from "autobind-decorator";
import CreateDrawGame from './CreateDraw';
import JoinGame from '../components/JoinGame';
import Home from '../components/Home';
import Menu from '../components/Menu';
import Lobby from '../components/Lobby';
import Footer from '../components/Footer';
import DrawingCanvas from './drawingCanvas';
import "./drawit.css";
import { mdiPen, mdiHeart } from '@mdi/js'
import Icon from '@mdi/react'
import 'lodash';
import "../components/menu.css";


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
          <h4 className="header_font"> 
            <Icon path={mdiPen} size={"1em"}/> 
            Draw My Meme! <sup className="sup_font">Alpha</sup>
          </h4>
          <hr className="hrstyle" />
        </div>
      </React.Fragment>
    );
  }

  render_footer(){
    return <Footer/>
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
      <CreateDrawGame />
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
          footer={this.render_footer()}
          socket_room="drawit"
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