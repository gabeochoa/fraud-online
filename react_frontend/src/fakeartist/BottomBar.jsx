

import React, { Component } from "react";
import autobind from 'autobind-decorator'
import SweetAlert from 'react-bootstrap-sweetalert';
import "../components/menu.css";
import "../drawit/drawit.css";
import ConfirmableButton from '../components/ConfirmableButton';

@autobind
class BottomBar extends Component{
    constructor(props){
        super(props);
        //current_artist, kill_websocket, changeLocation, clearGameState, send_message
    }

    onClickStringHandler(button_){
        switch(button_){
            case "end_round":
                if(this.props.current_artist != undefined){
                    this.props.send_message({
                        command: "end_round"
                    })
                }
            break;
            case "end_game":
                if(this.props.current_artist != undefined){
                    this.props.send_message({
                        command: "end_game"
                    })
                    this.props.changeLocation("lobby");
                }
            break;
            case "exit_room":
                this.props.kill_websocket(this.props.username);
                this.props.changeLocation("home");
                this.props.clearGameState();
            break;
            default: 
                console.log("button clicked but not handled", button_);
            break;
        }
    }

    render(){
        let allButtonProps = {
            variant: "contained",
            style: room_button_style
        }
        return (
            <React.Fragment>
            <div style={room_button_holder} className="button_font">
                <ConfirmableButton
                    name="end_round"
                    onClick={this.onClickStringHandler}
                    buttonProps={{
                        ...allButtonProps, 
                        confirm_text:"Are you really done?"
                    }}
                >
                    I'm done
                </ConfirmableButton>

                <ConfirmableButton
                    name="end_game"
                    onClick={this.onClickStringHandler}
                    buttonProps={{
                        ...allButtonProps, 
                        confirm_text:"Really end game?"
                    }}
                >
                    End Game
                </ConfirmableButton>

                <ConfirmableButton
                    name="exit_room"
                    onClick={this.onClickStringHandler}
                    buttonProps={{
                        ...allButtonProps, 
                        confirm_text:"Really exit room?"
                    }}
                >
                    Leave Game
                </ConfirmableButton>
            </div>
            </React.Fragment>
        );
    }
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
    boxSizing:"border-box",
    fontSize: "0.75em",
}





