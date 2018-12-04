import React, { Component } from "react";
import ReactDOM from "react-dom";
import ReconnectingWebSocket from 'reconnecting-websocket'

import SpyfallWaitingRoom from './room';

const column_list = {
    columnCount: 2,
    columnGap: "3px",
}
const column_list_item = {
    padding: "3px 10px",
    margin: "0 0 4px 0",
    backgroundColor: "#f0f0f0",
}

class Timer extends Component{

    constructor(props){
        super(props);

    }
    render(){
        return (
            <div style={{textAlign:"center"}}>
                <h1>{this.props.minutes}:{this.props.seconds}</h1>
            </div>
        );
    }
}

class SpyfallGame extends Component{

    constructor(props){
        super(props);

        this.state = {
        }

        this.handleClick = this.handleClick.bind(this);
        this.pretty_location = this.pretty_location.bind(this);
    }

    handleClick(event) {
        while(event.target.getAttribute("name") === null){
            event.target = event.target.parentNode;
        }
        let button = event.target.getAttribute("name");

        switch(button){
            case "room_end":
                this.props.changeLocation(this.props.access_code, "lobby");
            break;
            case "room_leave":
                this.props.changeLocation("", "menu");
            break;
            default:
            console.log("button was clicked : " + button);
            break
        }
    }

    renderPlayer(person){
        let extra = <p></p>;
        if(person.is_first){
            extra = <sup style={{color:"red"}}> 1st</sup>
        }
        return (<li key={person.username} style={column_list_item}>
                    {person.username} {extra}
                </li>);
    }



    pretty_location(location){
        if(location == null || location == undefined || location == "")
        {
            return location;
        }
        return (location.split("_").map(
                    (item) => {
                        return item.charAt(0).toUpperCase() + item.slice(1);
                }
            ).join(" "));
    }

    renderPlace(place){
        let place_text = null;
        if(place[1]){
            place_text =  <p style={{color: "#bbb", textDecoration: "line-through"}}> {this.pretty_location(place[0])} </p>
        }
        else{
            place_text = <p> {this.pretty_location(place[0])} </p>
        }
        return (<li key={place[0]} name={place[0]} onClick={this.props.handleClickLocation} style={column_list_item}>
                    {place_text}
                </li>);
    }
    renderRole(player){
        if(player.is_spy){
            return <p style={{textAlign:"center"}}> You are the {player.role} </p>
        }
        else{
            return (
                <React.Fragment>
                <p style={{textAlign:"center"}}>You are not the spy!</p>
                <p style={{textAlign:"center"}}>The location: {this.pretty_location(player.location)}</p>
                <p style={{textAlign:"center"}}>Your role: {player.role}</p>
                </React.Fragment>
            );
        }
    }

    render(){

        return (
            <div>
                <div style={{textAlign:"center"}}>
                    <Timer minutes={12} seconds={34} />
                    <hr className="hrstyle"/>
                    {this.renderRole(this.props.player)}
                    <hr className="hrstyle"/>
                </div>
                
                    <h4>Players:</h4>
                    <ul style={column_list}>
                        {this.props.players.map( (person) => this.renderPlayer(person))}
                    </ul>
                    <h4>Location Reference: </h4>
                    <ul style={column_list}>
                        {this.props.locations.map( (place) => this.renderPlace(place))}
                    </ul>
                    <hr className="hrstyle"/>

                <div style={{textAlign:"center"}}>
                    <a name="room_end" className="button is-outlined button_style"
                        onClick={this.handleClick}>End Game</a>           
                    <a name="room_leave" className="button is-outlined button_style" 
                        onClick={this.handleClick}>Leave Game</a>
                </div>
            </div>
        );
    }
}



class SpyfallGameParent extends Component{
    constructor(props) {
        super(props);

        const ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
        const host =  window.location.host;
        const extra = "username=" + this.props.username;
        const path = (ws_scheme + '://' + host + '/ws/spyfall/' + this.props.room + '/?' + extra);

        this.state = {
          in_lobby: true,
          location_state: "menu",
          player: {
              username: this.props.username,
              role: "",
              location: "",
              is_spy: false,
          },
          players: [],
          rws: new ReconnectingWebSocket(path),
          locations: [],
        };
    
        this.changeUsername = this.changeUsername.bind(this);
        this.process_message = this.process_message.bind(this);
        this.send_message = this.send_message.bind(this);
        this.changeLocationWrapper = this.changeLocationWrapper.bind(this);
        this.handleClickLocation = this.handleClickLocation.bind(this);

        this.state.rws.onopen = (event) => {
            console.log('WebSocket open', event);
            this.send_message({ command: 'get_room' });
        };
        this.state.rws.onmessage = e => {
            console.log("websocket on message", e.data);
            this.process_message(e.data)
        };
    
        this.state.rws.onerror = e => {
            console.log(e.message);
        };

        this.state.rws.onclose = (event) => {
            console.log("WebSocket closed", event);
            if(event.code == 1000 && event.reason == "leave_lobby"){
                return // we are leaving 
            }
           this.state.rws.reconnect();
        };
    }

    send_message(data){
        this.state.rws.send(JSON.stringify({ ...data }));
    }

    process_message(data) {
        const parsedData = JSON.parse(data);
    
        const command = parsedData.command;
        const message = parsedData.message;
        const sender = parsedData.sender;
        console.log("react recivied new message", command, message)
       
        if(command == "start_game"){
            this.setState({
                in_lobby: false
            })
        }
        
        if(command == "end_game"){
            this.setState({
                in_lobby: true
            })
        }

        //all commands
        {
            let update_players = [...message.players]
            update_players.forEach((item)=>{
                if (item.channel == sender){
                    item.is_me = true;
                    this.setState({
                        player: item,
                    })
                }
                else{
                    item.is_me = false;
                }
            });

            let locations = this.state.locations;
            if(locations.length == 0){
                locations = [...message.locations].map((item)=>{return [item, false]})
            }
                        
            this.setState({
              players: update_players,
              locations: locations,
            });
        }
    }

    changeUsername(username){
        this.setState({
            username: username,
        },
        this.joinRoom)
    }

    handleClickLocation(event){
        while(event.target.getAttribute("name") === null){
            event.target = event.target.parentNode;
        }
        const locations = [...this.state.locations]
        // // find the matching object
        const location = this.state.locations.filter(c => c[0] == event.target.getAttribute("name"))[0];
        // // index in our list 
        const index = this.state.locations.indexOf(location);
        locations[index] = [location[0], !location[1]];
        this.setState({locations});
    }

    changeLocationWrapper(room, location){
        if(location == "game"){
            //user wants to start the game
            // send the start_game message to all clients
            this.send_message({
                    command: "start_game"
            });
        }
        else if(location == "lobby"){
            this.send_message({
                command: "end_game"
            })
        }
        else{
            //otherwise its probably someone leaving the room to go back to the menu
            this.props.changeLocation(room, location, ()=>{
                this.send_message({command:"leave_lobby", username:this.props.username});
                this.state.rws.close(1000, "leave_lobby")
            })
        }
    }

    render(){
        if(this.state.in_lobby){
            return (
            <SpyfallWaitingRoom 
                access_code={this.props.room}
                username={this.props.username}
                players={this.state.players}
                changeLocation={this.changeLocationWrapper}
                />)
        }
        else{
            return (
                <SpyfallGame
                    players={this.state.players}
                    player={this.state.player}
                    locations={this.state.locations}
                    handleClickLocation={this.handleClickLocation}
                    changeLocation={this.changeLocationWrapper}
                />
            );
        }
    }
}

export default SpyfallGameParent