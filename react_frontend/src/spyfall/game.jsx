import React, { useState, useEffect } from "react";
import Timer from '../components/Timer';

import "../drawit/drawit.css";
import "./spyfall.css";

const column_list = {
    columnCount: 2,
    columnGap: "3px",
    columnRuleColor: "white",
    columnRuleStyle: "solid",
    columnRuleWidth: "10px",
}
const column_list_item = {
    padding: "0 0 0 10px",
    margin: "0 0 4px 0",
    backgroundColor: "#f0f0f0",
    columnSpan: "1",
    wordWrap: "break-word",
}

const pretty_location = (location) => {
    return (
        location == null || location == undefined || location == ""
            ? location :
            (
                location
                    .split("_")
                    .map((item) => { return item.charAt(0).toUpperCase() + item.slice(1); })
                    .join(" ")
            )
    );
}

const _GameComp = (props) => {
    const renderPlayer = (person) => {
        return (
            person.role == null ? null
                : (<li key={person.id} style={column_list_item}>
                    {person.username} {person.is_first && <sup style={{ color: "red" }}> 1st</sup>}
                </li>)
        );
    }
    const renderPlace = (place) => {
        const place_text = place[1]
            ? <p style={{ color: "#bbb", textDecoration: "line-through" }}> {pretty_location(place[0])} </p>
            : <p> {pretty_location(place[0])} </p>;
        return (
            <li key={place[0]} name={place[0]} onClick={props.handleClickLocation} style={column_list_item}>
                {place_text}
            </li>
        );
    }
    const renderRole = (player) => {
        return (
            <>
                {player.is_spy && <p style={{ textAlign: "center" }}> You are the {player.role} </p>}
                {!player.is_spy && <>
                    <p style={{ textAlign: "center" }}>You are not the spy!</p>
                    <p style={{ textAlign: "center" }}>The location: {pretty_location(player.location)}</p>
                    <p style={{ textAlign: "center" }}>Your role: {player.role}</p>
                </>}
            </>
        );
    }
    return (
        <div>
            <div style={{ textAlign: "center" }}>
                <Timer total_time={props.total_time} />
                <hr className="hrstyle" />
                {renderRole(props.player)}
            </div>
            <hr className="hrstyle" />
            <h4>Players:</h4>
            <ul style={column_list}>
                {props.players.map((person) => renderPlayer(person))}
            </ul>
            <h4>Location Reference: </h4>
            <ul style={column_list}>
                {props.locations.map((place) => renderPlace(place))}
            </ul>
            <hr className="hrstyle" />
            <div style={{ textAlign: "center" }}>
                <a name="room_end" className="button is-outlined button_style"
                    onClick={props.handleClick}>End Game</a>
                <a name="room_leave" className="button is-outlined button_style"
                    onClick={props.handleClick}>Leave Game</a>
            </div>
        </div>
    );
}

const CALLBACK_NAME = "spyfall_game";

const Game = (props) => {
    const [isLoading, setIsLoading] = useState(true);
    const [player, setPlayer] = useState({});
    const on_open_handler = (event) => { props.send_message({ command: 'get_room' }); };
    const process_message = (parsedData) => {
        // dont care what message, just "done loading"
        if (isLoading) { setIsLoading(false); }
        const command = parsedData.command;
        const message = parsedData.message;
        // const username = message.username;
        const sender = parsedData.sender;
        {
            let update_players = [...message.players]
            update_players.forEach((item) => {
                if (item.channel == sender) {
                    item.is_me = true; setPlayer(item);
                } else {
                    item.is_me = false;
                }
            });

            let locations = [];
            if (message.locations) {
                locations = [...message.locations].map((item) => { return [item, false] })
            }
            props.updateGameStarted(message.is_game_started);
            props.updatePlayers(update_players);
            props.set_extra_game_state("locations", locations);
        }
        if (command == "end_game") { props.changeLocation("_back"); }
    }
    const handleClickLocation = (event) => {
        while (event.target.getAttribute("name") === null) { event.target = event.target.parentNode; }
        const locations = [...props.extra_game_state.locations]
        const location = locations.filter(c => c[0] == event.target.getAttribute("name"))[0]; // find the matching object
        const index = locations.indexOf(location); // index in our list 
        locations[index] = [location[0], !location[1]];
        props.set_extra_game_state("locations", locations);
    }

    const onClickHandler = (event) => {
        while (event.target.getAttribute("name") === null) {
            event.target = event.target.parentNode;
        }
        const button_ = event.target.getAttribute("name");
        console.log("button clicked", button_)
        switch (button_) {
            case "room_leave":
                props.kill_websocket(props.username);
                props.changeLocation("home");
                props.clearGameState();
                break;
            case "room_end":
                props.send_message({ command: "end_game" })
                props.changeLocation("lobby");
                break;
        }
    }

    useEffect(() => {
        props.register_socket_callbacks(CALLBACK_NAME, "onopen", on_open_handler);
        props.register_socket_callbacks(CALLBACK_NAME, "onmessage", process_message);
        props.set_extra_game_state("locations", []);
        props.send_message({ command: 'get_room' });
        return () => { // cleanup
            props.unregister_socket_callbacks(CALLBACK_NAME, "onmessage");
        }
    }, []);

    return (
        <_GameComp
            player={player}
            locations={props.extra_game_state.locations || []}
            username={props.username}
            players={props.players}
            handleClick={onClickHandler}
            handleClickLocation={handleClickLocation}
            total_time={props.game_options.timer}
        />
    );
}

export default Game;