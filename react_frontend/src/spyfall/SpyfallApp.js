import React, { Component } from "react";
import ReactDOM from "react-dom";
import CreateSpyfallGame from './CreateSpyfallGame';
import JoinGame from '../components/JoinGame';
import Home from '../components/Home';
import Menu from '../components/Menu';
import Lobby from '../components/Lobby';
import Footer from '../components/Footer';
import autobind from "autobind-decorator";
import SpyfallAbout from './SpyfallAbout';
import "../drawit/drawit.css"
import "./spyfall.css"

import { mdiHatFedora } from '@mdi/js'
import Icon from '@mdi/react'
import Game from "./game";

const SpyfallApp = () => {
    const header = (
      <>
        <div className="div_set">
          <h4 className="header_font">
            <Icon path={mdiHatFedora} size={"1em"}/>
            Spyfall! <sup className="sup_font">Beta</sup>
          </h4>
          <hr className="hrstyle" />
        </div>
      </>
    );

    var location_data = {
      home: <Home/>,
      lobby: <Lobby/>,
      create: <CreateSpyfallGame/>,
      join: <JoinGame/>,
      game: <Game/>,
      about: <SpyfallAbout/>,
    }

    return(
      <div style={top_level}>
        <Menu
          starting_location="home"
          all_locations={location_data}
          header={header}
          footer={<Footer/>}
          socket_room="spyfall"
          />
      </div>
    );
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
