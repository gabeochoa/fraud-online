import React, { Component, useState, useEffect } from "react";
import autobind from 'autobind-decorator';
import PropTypes from 'prop-types';
import Icon from '@mdi/react'
import { mdiDelete, mdiPen } from '@mdi/js'
import "./menu.css";

const SizeZeroIcon = (props) => {
    return (
        <div style={{ fontSize: 0 }}>
            <Icon {...props}></Icon>
        </div>
    );
}

const LobbyPerson = ({
    id, is_me, username, handleClick
}) => {
    let icon = <SizeZeroIcon name={icon_name} player={id} path={mdiDelete} size={"0.75em"} />
    let icon_name = "kick_person"
    if (is_me) {
        icon_name = "edit_name"
        icon = <SizeZeroIcon name={icon_name} path={mdiPen} size={"0.75em"} />
    }
    return (
        <li key={id} style={{ display: "float", marginBottom: 5 }}>
            <h1 style={{ float: "left", paddingLeft: 5, wordWrap: "break-word" }}>
                {username}
            </h1>
            <div style={{ float: "right" }} player={id} name={icon_name} onClick={handleClick}>
                {icon}
            </div>
        </li>
    );
}

const Lobby = ({
    changeLocation,
    room_code,
    rws,
    is_game_started,
    players,
    register_socket_callbacks,
    send_message,
    socket_null,
    unregister_socket_callbacks,
    updatePlayers,
    updateGameStarted,
    update_websocket,
    username,
}) => {
    const [isLoaded, setIsLoaded] = useState(false)

    const process_message = (parsedData) => {
        console.log("Lobby process_message", parsedData);
        if (!isLoaded) { setIsLoaded(true) }
        const command = parsedData.command;
        const sender = parsedData.sender;
        const is_game_started = parsedData.message.is_game_started;
        let players = parsedData.message.players;
        players.forEach((item) => { if (item.channel == sender) { item.is_me = true; } });
        if (command == "get_room_response") { }
        else if (command == "start_game") { changeLocation("game") }
        else if (command == "end_game") { }
        updatePlayers(players);
        updateGameStarted(is_game_started);
    }

    const leave_lobby = () => {
        try { changeLocation("home"); } catch (error) { console.warn(error, "failed to change location") }
        try { clearGameState(); } catch (error) { console.warn(error, "failed to clear state ") }
        try { kill_websocket(username); } catch (error) { console.warn(error, "failed to kill") }
    }

    const handleClick = (event) => {
        while (event.target.getAttribute("name") === null) { event.target = event.target.parentNode; }
        let button = event.target.getAttribute("name");
        console.log("button was clicked : " + button);
        switch (button) {
            case "lobby_start":
                if ((!is_game_started) && isLoaded) {
                    send_message({ command: "start_game" });
                    changeLocation("game");
                }
                break;
            case "lobby_leave": leave_lobby(); break;
            case "edit_name":
                kill_websocket(username);
                changeLocation("join");
                break;
            case "kick_person":
                if (!is_game_started) { kickPlayer(event.target.getAttribute("player")); }
                break;
            default: console.log("default case"); break
        }
    }

    useEffect(() => {
        // connect to the room that we are trying to join
        if (socket_null()) {
            update_websocket(room_code, { username });
        }
        setIsLoaded(true)
        register_socket_callbacks("lobby", "onmessage", process_message);
        register_socket_callbacks("lobby", "player_kicked", leave_lobby);
        send_message({ command: 'get_room' });
        return () => {
            // clean up 
            unregister_socket_callbacks("lobby", "onmessage");
            unregister_socket_callbacks("lobby", "player_kicked");
        }
    }, []);

    return (
        <>
            <div className="div_set">
                <h4 className="lobby_font">
                    {is_game_started
                        ? "Game is already in progress"
                        : "Waiting for players..."
                    }
                </h4>
                <h5>Room Code: {room_code}</h5>
                <hr className="hrstyle" />
                <div>
                    <ol className="olstyle">
                        {players.map((item) => <LobbyPerson key={item.id} {...item} handleClick={handleClick} />)}
                    </ol>
                </div>
                <hr className="hrstyle" />
                <div className="field is-centered" >
                    <a name="lobby_start" className="button is-outlined button_style button_font"
                        onClick={handleClick}
                        style={button_stretch}
                    >Start Game</a>
                    <a name="lobby_leave" className="button is-outlined button_style button_font"
                        onClick={handleClick}
                        style={button_stretch}
                    >Leave Game</a>
                </div>
            </div>
        </>
    )
}

const button_stretch = {
    width: "40%", // 1/X where x is num of buttons
}

export default Lobby;