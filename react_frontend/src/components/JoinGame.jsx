import React, { useState } from "react";
import "./menu.css";

const JoinGame = ({
    changeLocation,
    changeUsername,
    changeRoomCode,
    username = "",
    room_code = "",
}) => {
    const [name, setName] = useState(username);
    const [roomCode, setRoomCode] = useState(room_code);
    const handleChange = (event) => {
        console.log("handle change", event, event.target.name, event.target.value);
        var name = event.target.name;
        if (name == "name") { setName(event.target.value); }
        if (name == "room_code") { setRoomCode(event.target.value) }
    }
    const handleClick = (event) => {
        while (event.target.getAttribute("name") === null) { event.target = event.target.parentNode; }
        let button = event.target.getAttribute("name");
        // console.log("button was clicked : " + button);
        switch (button) {
            case "join_join":
                changeUsername(name, () => { });
                // must happen before location change ? 
                changeRoomCode(roomCode, () => { });
                changeLocation("lobby", () => { });
                break;
            case "join_back":
                changeUsername(name, () => { });
                changeLocation("_back", () => {
                    // console.log("Change location menu")
                });
                break;
            default:
                console.log("button was clicked : " + button);
                break
        }
    }
    return (
        <>
            <div className="div_set">
                <input 
                    name="name" className="input input_style" 
                    value={name} onChange={handleChange} 
                    type="text" placeholder="Name" 
                />
                <div className="vspace10" />
                <input 
                    name="room_code" className="input input_style" 
                    value={roomCode} onChange={handleChange} 
                    type="text" placeholder="Room Code" 
                />
                <hr className="hrstyle" />
                <a name="join_join" className="button is-outlined button_style button_font"
                    onClick={handleClick}
                    style={button_stretch}
                >Join</a>
                <a name="join_back" className="button is-outlined button_style button_font"
                    onClick={handleClick}
                    style={button_stretch}
                >Back</a>
            </div>
        </>
    );
}


const button_stretch = {
    width: "40%", // 1/X where x is num of buttons
}

export default JoinGame;