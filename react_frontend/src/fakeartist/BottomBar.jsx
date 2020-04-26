import React, { useEffect } from "react";
import "../components/menu.css";
import "../drawit/drawit.css";
import ConfirmableButton from '../components/ConfirmableButton';
import 'lodash';

const BottomBar = (props) => {
    //current_artist, kill_websocket, changeLocation, clearGameState, send_message
    const allButtonProps = {
        variant: "contained",
        style: room_button_style
    }

    const onClickStringHandler = (button_) => {
        switch (button_) {
            case "end_round":
                if (props.current_artist != undefined) {
                    props.send_message({ command: "end_round" })
                }
                break;
            case "end_game":
                if (props.current_artist != undefined) {
                    props.send_message({ command: "end_game" })
                    props.changeLocation("lobby");
                }
                break;
            case "exit_room":
                props.kill_websocket(props.username);
                props.changeLocation("home");
                props.clearGameState();
                break;
            default:
                console.log("button clicked but not handled", button_);
                break;
        }
    }

    const buttons = [
        {
            show: props.hideState[0],
            name: "end_round",
            buttonProps:{ confirm_text: "Are you really done?" },
            text: "I'm done",
        },
        {
            show: props.hideState[1],
            name: "end_game",
            buttonProps:{ confirm_text: "Really end game?" },
            text: "End Game",
        },
        {
            show: props.hideState[2],
            name: "exit_room",
            buttonProps:{ confirm_text: "Really exit room?"},
            text: "Leave Game",
        },
    ];

    return (
        <div style={room_button_holder} className="button_font">
            {buttons.map(({
                show, ref, name, buttonProps, text
            }) => {
                return ( !show
                        ? null
                        : <ConfirmableButton
                            key={name}
                            name={name}
                            onClick={onClickStringHandler}
                            buttonProps={{ ...allButtonProps, ...buttonProps }}
                        >
                            {text}
                        </ConfirmableButton>
                )
            }
            )}
        </div>
    );
}

export default BottomBar;


const room_button_holder = {
    position: "absolute",
    left: 0,
    bottom: "2em",
    width: "100%",
}
const room_button_style = {
    touchAction: "auto",
    pointerEvents: "auto",
    width: "23.33%",
    margin: "5px",
    maxWidth: "150px",
    boxSizing: "border-box",
    fontSize: "0.75em",
}





