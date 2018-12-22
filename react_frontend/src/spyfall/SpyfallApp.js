import React, { Component } from "react";
import ReactDOM from "react-dom";
import CreateSpyfallGame from './CreateSpyfallGame';
import JoinGame from '../components/JoinGame';
import Home from '../components/Home';
import Menu from '../components/Menu';
import Lobby from '../components/Lobby';
import Footer from '../components/Footer';
import autobind from "autobind-decorator";
import "../drawit/drawit.css"
import "./spyfall.css"

import { mdiHatFedora } from '@mdi/js'
import Icon from '@mdi/react'
import NewGame from "./new_game";


@autobind
class SpyfallApp extends Component {
  constructor(props) {
    super(props);
  }

  render_header(){
    return (<React.Fragment>
        <div className="div_set">
          <h4 style={{fontSize: 30}}> <Icon path={mdiHatFedora} size={1.5}/> 
            Spyfall! <sup style={{color: "red", fontSize: 12}}>Beta</sup>
          </h4>
          <hr className="hrstyle" />
        </div>
      </React.Fragment>);
  } 
  
  render_footer(){
    return <Footer />
  }

  render() {
    let home_jsx = (
      <Home/>
    );
    let lobby_jsx = (
      <Lobby/>
    );

    let create_jsx = (
      <CreateSpyfallGame/>
    );

    let join_jsx = (
      <JoinGame/>
    );

    let game_jsx = (
      <NewGame/> 
    );

    var location_data = {
      home: home_jsx,
      lobby: lobby_jsx,
      create: create_jsx,
      join: join_jsx,
      game: game_jsx,
    }
  
    return(
      <div style={top_level}>
        <Menu
          starting_location="home"
          all_locations={location_data}
          header={this.render_header()}
          footer={this.render_footer()}
          socket_room="spyfall"
          />
      </div>
    );

        // content = <SpyfallGameParent
        //            room={this.state.room}
        //            username={this.state.username}
        //            changeLocation={this.changeLocation}
        //            waitForSocket={this.waitForSocket}
        //            minutes={this.state.minutes}
        //           /> 
 
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
wrapper ? ReactDOM.render(<SpyfallApp />, wrapper) : null;