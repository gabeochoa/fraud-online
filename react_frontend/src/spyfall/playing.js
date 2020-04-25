import React, { Component } from "react";
import ReconnectingWebSocket from 'reconnecting-websocket'
import SpyfallWaitingRoom from './room';
import SpyfallGame from './game';
import "./spyfall.css"

const SpyfallGameParent = (props) => {
    const ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
    const host = window.location.host;
    const extra = ("username=" + props.username + "&" + "minutes=" + props.minutes);
    const path = (ws_scheme + '://' + host + '/ws/spyfall/' + props.room + '/?' + extra);

    const [inLobby, setInLobby] = useState(true);
    const [locationState, setLocationState] = useState("menu");
    const [username, setUsername] = useState(props.username);
    const [player, setPlayer] = useState({
        username: props.username,
        role: "",
        location: "",
        is_spy: false,
    });
    const [players, setPlayers] = useState([]);
    const [rws, setRws] = useState(new ReconnectingWebSocket(path));
    const [locations, setLocations] = useState([]);
    const [totalTime, setTotalTime] = useState(props.minutes * 60);
    const [isGameStarted, setIsGameStarted] = useState(false);

    rws.onopen = (event) => {
        console.log('WebSocket open', event);
        this.send_message({ command: 'get_room' });
    };
    rws.onmessage = e => {
        console.log("websocket on message", e.data);
        this.process_message(e.data)
    };
    rws.onerror = e => {
        console.log(e.message);
    };

    rws.onclose = (event) => {
        console.log("WebSocket closed", event);
        if (event.code == 1000 && event.reason == "leave_lobby") { // we are leaving 
            return
        }
        if (event.code == 1001) { // we are being kicked
            this.changeLocationWrapper("", "menu");
            return
        }
        rws.reconnect();
    };

    const send_message = (data) => { rws.send(JSON.stringify({ ...data })); }
    const process_message = (data) => {
        const parsedData = JSON.parse(data);
        const command = parsedData.command;
        const message = parsedData.message;
        const sender = parsedData.sender;
        console.log("react recivied new message", command, message)
        if (command == "start_game") { setInLobby(false); }
        if (command == "end_game") { setInLobby(true); }
        //all commands
        {
            let update_players = [...message.players]
            update_players.forEach((item) => {
                if (item.channel == sender) {
                    item.is_me = true;
                    setPlayer(item);
                } else {
                    item.is_me = false;
                }
            });
            if (locations.length == 0) {
                locations = [...message.locations].map((item) => { return [item, false] })
            }
            setPlayers(update_players);
            setLocations(locations);
            setIsGameStarted(message.is_game_started);
            setTotalTime(message.minutes * 60);
        }
    }

    const changeUsername = (username) => {
        setUsername(username);
        this.joinRoom();
    }

    const kickPerson = (person) => {
        const player = players.filter(c => c.id == parseInt(person))[0];
        send_message({ command: "kick_player", player: player, });
    }
    const handleClickLocation = (event) => {
        while (event.target.getAttribute("name") === null) {
            event.target = event.target.parentNode;
        }
        // find the matching object
        const location = locations.filter(c => c[0] == event.target.getAttribute("name"))[0];
        // index in our list 
        const index = locations.indexOf(location);
        locations[index] = [location[0], !location[1]];
        setLocations(locations)
    }
    const changeLocationWrapper = (room, location) => {
        if (location == "game") { // user wants to start the game; // send the start_game message to all clients
            send_message({ command: "start_game" });
        } else if (location == "lobby") {
            send_message({ command: "end_game" })
        } else { //otherwise its probably someone leaving the room to go back to the menu
            props.changeLocation(room, location, () => {
                send_message({ command: "leave_lobby", username });
                rws.close(1000, "leave_lobby");
            });
        }
    }
    return inLobby? 
        (
            <SpyfallWaitingRoom
                access_code={props.room}
                username={username}
                players={players}
                changeLocation={changeLocationWrapper}
                kickPerson={kickPerson}
                is_game_started={isGameStarted}
            />
        )
        :
        (
            <SpyfallGame
                players={players}
                player={player}
                locations={locations}
                handleClickLocation={handleClickLocation}
                changeLocation={changeLocationWrapper}
                total_time={totalTime}
            />
        );
}

export default SpyfallGameParent