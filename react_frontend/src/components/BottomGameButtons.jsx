import React, { Component, useState } from "react";
import autobind from 'autobind-decorator'
import SweetAlert from 'react-bootstrap-sweetalert';
import "./menu.css";
import "../drawit/drawit.css";
import ConfirmableButton from './ConfirmableButton';

const BottomGameButtons = (props) => {
    //current_artist, kill_websocket, changeLocation, clearGameState, send_message
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
    };
    let allButtonProps = {
        variant: "contained",
        style: room_button_style
    }
    return (
        <>
            <div style={room_button_holder} className="button_font">
                <ConfirmableButton
                    closeConfirm={props.closeConfirm}
                    name="end_round"
                    onClick={onClickStringHandler}
                    buttonProps={{ ...allButtonProps, confirm_text: "Really end round?" }}
                >
                    Someone got it
                </ConfirmableButton>
                <ConfirmableButton
                    closeConfirm={props.closeConfirm}
                    name="end_game"
                    onClick={onClickStringHandler}
                    buttonProps={{ ...allButtonProps, confirm_text: "Really end game?" }}
                >
                    End Game
                </ConfirmableButton>
                <ConfirmableButton
                    closeConfirm={props.closeConfirm}
                    name="exit_room"
                    onClick={onClickStringHandler}
                    buttonProps={{ ...allButtonProps, confirm_text: "Really exit room?" }}
                >
                    Leave Game
                </ConfirmableButton>
            </div>
        </>
    );
}

export default BottomGameButtons;

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
