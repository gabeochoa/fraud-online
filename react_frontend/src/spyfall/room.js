// this is the screen for waiting to play
import React, { Component } from "react";
import ReactDOM from "react-dom";
import Icon from '@mdi/react'
import { mdiHatFedora, mdiDelete, mdiPencil, mdiPen } from '@mdi/js'

class MyIcon extends Component{
    render(){
        return (
            <div style={{fontSize:0}}>
                <Icon {...this.props}></Icon>
            </div>
        );
    }
}

class SpyfallWaitingRoom extends Component {

    constructor(props) {
        super(props);
    
        this.state = { 
            location: "home",
            name: this.props.username,
          };
    
        // This binding is necessary to make `this` work in the callback
        this.handleClick = this.handleClick.bind(this);
        this.render_person = this.render_person.bind(this);
    }
    
    handleClick(event) {
        while(event.target.getAttribute("name") === null){
            event.target = event.target.parentNode;
        }
        let button = event.target.getAttribute("name");

        switch(button){
            case "edit_name":
                this.props.changeLocation(this.props.access_code, "menu");
            break;
            case "room_leave":
                this.props.changeLocation("", "menu");
            break;
            case "room_start":
                this.props.changeLocation(this.props.access_code, "game");
            break;
            default:
            console.log("button was clicked : " + button);
            break
        }
    }

    render_person(person){
        let icon = <p></p>
        let icon_name = "kick_person"
        if(person.is_me){
            icon_name = "edit_name"
            icon = <MyIcon name={icon_name} path={mdiPen} size={1}/>
        }
        else{
            icon_name = "kick_person"
            icon = <MyIcon name={icon_name} path={mdiDelete} size={1} />
        }
        return (
            <li key={person.id} style={{display:"float",  marginBottom:5}}>
                <h1 style={{float: "left", paddingLeft:5}}>
                        {person.username} 
                </h1>
                <div style={{float: "right"}} name={icon_name} onClick={this.handleClick}> 
                    {icon}
                </div>
            </li>
        );
    }

    render(){
        return (
            <React.Fragment>
                <h4 style={{fontSize: 30}}><Icon path={mdiHatFedora} size={1.5}/>Waiting For Players...</h4>
                <h5>Access Code: {this.props.access_code}</h5>
                <hr className="hrstyle"/>
                <div>
                    <ol className="olstyle">
                        {this.props.players.map((item) => this.render_person(item))}
                    </ol>
                </div>
                <hr className="hrstyle"/>
                <div className="field is-centered button_bar_style">
                    <a name="room_start" className="button is-outlined button_style"
                        onClick={this.handleClick}>Start Game</a>           
                    <a name="room_leave" className="button is-outlined button_style" 
                        onClick={this.handleClick}>Leave Game</a>
                </div>
            </React.Fragment>
        );
    }
}

export default SpyfallWaitingRoom;