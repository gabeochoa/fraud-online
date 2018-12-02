// this is the screen for waiting to play
import React, { Component } from "react";
import ReactDOM from "react-dom";
import Container from "../components/Container";
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
            name: "",
            people: [               
                {
                    id: 1,
                    name: "100% me",
                    is_me: true,
                },
                {
                    id: 2,
                    name: "not me",
                    is_me: false
                },
                {
                    id: 3,
                    name: "also not me",
                    is_me: false
                },
                {
                    id: 4,
                    name: "might be me",
                    is_me: false
                },
            ]
          };
    
        // This binding is necessary to make `this` work in the callback
        this.handleClick = this.handleClick.bind(this);
        this.render_person = this.render_person.bind(this);
    }
    
    handleClick(event) {
        while(event.target.getAttribute("name") === null){
            event.target = event.target.parentNode;
        }
        console.log("button was clicked : " + event.target.getAttribute("name"));
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
                        {person.name} 
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
                <h5>Access Code: {this.props.access_code.toUpperCase()}</h5>
                <hr className="hrstyle"/>
                <div>
                    <ol className="olstyle">
                        {this.state.people.map((item) => this.render_person(item))}
                    </ol>
                </div>
                <hr className="hrstyle"/>
                <a name="room_start" className="button is-outlined button_style"
                    onClick={this.handleClick}>Start Game</a>           
                <a name="room_leave" className="button is-outlined button_style" 
                    onClick={this.handleClick}>Leave Game</a>
            </React.Fragment>
        );
    }
}

export default SpyfallWaitingRoom;