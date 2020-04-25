import React, { Component } from "react";
import ReactDOM from "react-dom";
import JoinGame from '../components/JoinGame';
import Home from '../components/Home';
import Menu from '../components/Menu';
import Lobby from '../components/Lobby';
import Footer from '../components/Footer';
import CorpAbout from './CorpAbout';
import autobind from "autobind-decorator";

import Game from './game';

import {  mdiDomain } from '@mdi/js'
import Icon from '@mdi/react'


function CreateCorp(props){
    return null;
}

@autobind
class Corp extends Component {
  constructor(props) {
    super(props);
  }

  render_header(){
    return (<React.Fragment>
        <div className="div_set">
          <h4 className="header_font"> 
            <Icon path={mdiDomain} size={"1em"}/> 
            Corporate Takeover! <sup className="sup_font">Alpha</sup>
          </h4>
          <hr className="hrstyle" />
        </div>
      </React.Fragment>);
  } 
  
  render_footer(){
    return <Footer />
  }

  render() {

    var location_data = {
      home: <Home/>,
      lobby:  <Lobby/>,
      create: <CreateCorp/>,
      join: <JoinGame/>,
      game: <Game/>,
      about: <CorpAbout/>,
    }

    location_data['home'] = <Game/>
  
    return(
      <div style={top_level}>
        <Menu
          starting_location="home"
          all_locations={location_data}
          header={this.render_header()}
          footer={this.render_footer()}
          socket_room="corp"
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
wrapper ? ReactDOM.render(<Corp />, wrapper) : null;