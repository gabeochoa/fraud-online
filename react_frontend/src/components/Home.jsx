import React, { Component } from "react";
import autobind from 'autobind-decorator';
import PropTypes from 'prop-types';
import "./menu.css";

const Home = (props) => {
    const handleClick = (event) => {
        while (event.target.getAttribute("name") === null) { event.target = event.target.parentNode; }
        let button = event.target.getAttribute("name");
        console.log("button was clicked : " + button);
        switch (button) {
            case "home_create": props.changeLocation("create"); break;
            case "home_join": props.changeLocation("join"); break;
            case "home_about": props.changeLocation("about"); break;
            default: console.log("default case"); break
        }
    }
    return (
        <>
            <div className="div_set">
                <a name="home_create" className="button is-outlined button_style button_font"
                    style={{ width: "40%" }} onClick={handleClick}>
                    New Game
                </a>
                <a name="home_join" className="button is-outlined button_style button_font"
                    style={{ width: "40%" }} onClick={handleClick}>
                    Join Game
                </a>
                <a name="home_about" className="button is-outlined button_style button_font"
                    style={{ width: "40%" }} onClick={handleClick}>
                    About/Rules
                </a>
            </div>
        </>
    );
}

export default Home;