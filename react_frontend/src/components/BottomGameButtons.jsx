import React, { Component } from "react";
import Button from '@material-ui/core/Button';
import autobind from 'autobind-decorator'
import SweetAlert from 'react-bootstrap-sweetalert';
import "./menu.css";
import "../drawit/drawit.css";


@autobind
class BottomGameButtons extends Component{
    constructor(props){
        super(props);
        //current_artist, kill_websocket, changeLocation, clearGameState, send_message
        this.state = {
            confirm_box: null,
        }
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

    closeConfirmBox(){
        this.setState({confirm_box: null})
    }

    onClickHandler(event){
        if (event.target == this.canvas) {
            event.preventDefault();
        }
          
        console.log("click event", event, event.target)

        while(event.target.getAttribute("name") === null){
            event.target = event.target.parentNode;
        }
        const button_ = event.target.getAttribute("name");
        const confirm_text = event.target.getAttribute("confirm_text");
        this.setState({
            confirm_box: (
                <SweetAlert
                    warning
                    showCancel
                    confirmBtnText={"Yes"}
                    confirmBtnBsStyle="warning"
                    cancelBtnBsStyle="default"
                    title="Are you sure?"
                    onConfirm={() => { this.onClickStringHandler(button_); this.closeConfirmBox() }}
                    onCancel={ () => {this.closeConfirmBox()}}
                    closeOnClickOutside={true}
                    >
                    {confirm_text}
                </SweetAlert>
            ),
        });
    }

    render(){
        return (
            <React.Fragment>
            {this.state.confirm_box != null && this.state.confirm_box}
            <div style={room_button_holder} className="button_font">
                <Button variant="contained" 
                    name="end_round" 
                    confirm_text="Really end round?"
                    onClick={this.onClickHandler} style={room_button_style}>
                    Someone got it
                </Button>
                <Button variant="contained" name="end_game" 
                    confirm_text="Really end game?"
                    onClick={this.onClickHandler} style={room_button_style}>
                    End Game
                </Button>
                <Button variant="contained" name="exit_room" 
                    confirm_text="Really exit room?"
                    onClick={this.onClickHandler} style={room_button_style}>
                    Leave Game
                </Button>
            </div>
            </React.Fragment>
        );
    }
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
    boxSizing:"border-box",
    fontSize: "0.75em",
}
