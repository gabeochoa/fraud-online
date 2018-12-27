import React, {Component} from "react";
import ReactDOM from 'react-dom';

import CreateFakeArtistGame from './CreateFakeArtistGame';
import JoinGame from '../components/JoinGame';
import FakeArtistGame from "./FakeArtistGame";
import Home from '../components/Home';
import Menu from '../components/Menu';
import Lobby from '../components/Lobby';
import Footer from '../components/Footer';
import { mdiEarth } from "@mdi/js";
import Icon from '@mdi/react'
import MyCanvas from "../components/MyCanvas";

function FakeArtistHeader(props){
    return (
        <React.Fragment>
        <div className="div_set">
            <h4 className="header_font"> 
            <Icon path={mdiEarth} size={"1em"}/> 
            Fake Artist! <sup className="sup_font">Alpha</sup>
            </h4>
            <hr className="hrstyle" />
        </div>
        </React.Fragment>
    );
}

function FakeArtistApp(props){
    
    var location_data = {
        home: <Home/>,
        lobby: <Lobby/>,
        create: <CreateFakeArtistGame/>,
        join: <JoinGame/>,
        game: <FakeArtistGame/>,
    }

    location_data["home"] = <MyCanvas/>

    return(
        <div className="top_level">
            <Menu
            starting_location="home"
            all_locations={location_data}
            header={<FakeArtistHeader/>}
            footer={<Footer/>}
            socket_room="fakeartist"
            />
        </div>
    );
}

const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<FakeArtistApp />, wrapper) : null;