import React from "react";
import ReactDOM from 'react-dom';
import CreateDrawGame from './CreateDraw';
import JoinGame from '../components/JoinGame';
import Home from '../components/Home';
import Menu from '../components/Menu';
import Lobby from '../components/Lobby';
import Footer from '../components/Footer';
import DrawingCanvas from './drawingCanvas';
import DrawitAbout from './DrawitAbout';
import "./drawit.css";
import { mdiPen} from '@mdi/js'
import Icon from '@mdi/react'
import 'lodash';
import "../components/menu.css";

const DrawItApp = (props) => {
  return (
    <div style={top_level}>
      <Menu
        starting_location="home"
        all_locations={{
          home: <Home />,
          lobby: <Lobby/>,
          create: <CreateDrawGame />,
          join: <JoinGame />,
          game: <DrawingCanvas/>,
          about: <DrawitAbout />,
        }}
        header={
          <>
            <div className="div_set">
              <h4 className="header_font">
                <Icon path={mdiPen} size={"1em"} />
            Draw My Meme! <sup className="sup_font">Alpha</sup>
              </h4>
              <hr className="hrstyle" />
            </div>
          </>
        }
        footer={<Footer />}
        socket_room="drawit"
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
wrapper ? ReactDOM.render(<DrawItApp />, wrapper) : null;