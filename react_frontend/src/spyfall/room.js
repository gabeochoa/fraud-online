// this is the screen for waiting to play
import React from "react";
import Icon from '@mdi/react'
import { mdiHatFedora, mdiDelete, mdiPen } from '@mdi/js'

const MyIcon = (props) => {
    return (
        <div style={{ fontSize: 0 }}>
            <Icon {...props}></Icon>
        </div>
    );
}

const SpyfallWaitingRoom = (props) => {
    const handleClick = (event) => {
        while (event.target.getAttribute("name") === null) {
            event.target = event.target.parentNode;
        }
        let button = event.target.getAttribute("name");

        switch (button) {
            case "edit_name":
                props.changeLocation(props.access_code, "menu");
                break;
            case "room_leave":
                props.changeLocation("", "menu");
                break;
            case "room_start":
                if (!props.is_game_started) {
                    props.changeLocation(props.access_code, "game");
                }
                break;
            case "kick_person":
                if (!props.is_game_started) {
                    props.kickPerson(event.target.getAttribute("player"));
                }
                break
            default:
                console.log("button was clicked : " + button);
                break
        }
    }

    const render_person = (person) => {
        let icon = <p></p>
        let icon_name = "kick_person"
        if (person.is_me) {
            icon_name = "edit_name"
            icon = <MyIcon name={icon_name} path={mdiPen} size={1} />
        }
        else {
            icon_name = "kick_person"
            icon = <MyIcon name={icon_name} player={person.id} path={mdiDelete} size={1} />
        }
        return (
            <li key={person.id} style={{ display: "float", marginBottom: 5 }}>
                <h1 style={{ float: "left", paddingLeft: 5, wordWrap: "break-word" }}>
                    {person.username}
                </h1>
                <div style={{ float: "right" }} name={icon_name} onClick={this.handleClick}>
                    {icon}
                </div>
            </li>
        );
    }
    let content = ""
    if (props.is_game_started) {
        content = "Game is in progess"
    } else {
        content = "Waiting For Players..."
    }

    return (
        <>
            <h4 style={{ fontSize: 30 }}><Icon path={mdiHatFedora} size={1.5} />{content}</h4>
            <h5>Access Code: {props.access_code}</h5>
            <hr className="hrstyle" />
            <div>
                <ol className="olstyle">
                    {props.players.map((item) => render_person(item))}
                </ol>
            </div>
            <hr className="hrstyle" />
            <div className="field is-centered button_bar_style">
                <a name="room_start" className="button is-outlined button_style"
                    onClick={handleClick}>Start Game</a>
                <a name="room_leave" className="button is-outlined button_style"
                    onClick={handleClick}>Leave Game</a>
            </div>
        </>
    );
}

export default SpyfallWaitingRoom;