import React, { Component } from "react";
import ReactDOM from "react-dom";
import ReconnectingWebSocket from 'reconnecting-websocket'

import SpyfallWaitingRoom from './room';

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

import "./spyfall.css"

class Timer extends Component{

    constructor(props){
        super(props);
    }
    render(){
        if(this.props.minutes == 0 && parseInt(this.props.seconds) < 30){
            return (
                <div style={{textAlign:"center"}} className="blinking">
                    <h1>{this.props.minutes}:{this.props.seconds}</h1>
                </div>
            );
        }
        return (
            <div style={{textAlign:"center"}}>
                <h1>{this.props.minutes}:{this.props.seconds}</h1>
            </div>
        );
    }
}


function str_pad_left(string,pad,length) {
    return (new Array(length+1).join(pad)+string).slice(-length);
}

class SpyfallGame extends Component{

    constructor(props){
        super(props);

        this.secondsRemaining = this.props.total_time;

        let minutes = Math.floor(this.secondsRemaining / 60);
        let seconds = this.secondsRemaining - minutes * 60;
        
        this.state = {
            value: str_pad_left(minutes,'0',2),
            seconds: str_pad_left(seconds,'0',2),
        }

        this.intervalHandle;
        this.startCountDown = this.startCountDown.bind(this);
        this.tick = this.tick.bind(this);

        this.handleClick = this.handleClick.bind(this);
        this.pretty_location = this.pretty_location.bind(this);

    }

    componentDidMount(){
        this.startCountDown();
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

    componentWillUnmount(){
        clearInterval(this.intervalHandle);
    }
    
    tick() {
        let minutes = Math.floor(this.secondsRemaining / 60);
        let seconds = this.secondsRemaining - minutes * 60;

        this.setState({
            seconds: str_pad_left(seconds,'0',2),
            value: str_pad_left(minutes,'0',2),
        });

        if (minutes === 0 & seconds === 0) {
            clearInterval(this.intervalHandle);
        }
        this.secondsRemaining--
    }

    startCountDown() {
        this.intervalHandle = setInterval(this.tick, 1000);
        this.secondsRemaining = this.props.total_time;
        this.setState({
            isClicked : true
        })
    }

    renderPlayer(person){
        if(person.role == null){return}
        let extra = <p></p>;
        if(person.is_first){
            extra = <sup style={{color:"red"}}> 1st</sup>
        }
        return (<li key={person.id} style={column_list_item}>
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
                    <Timer minutes={this.state.value} seconds={this.state.seconds} />
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
          total_time: this.props.minutes*60,
        };
    
        this.changeUsername = this.changeUsername.bind(this);
        this.process_message = this.process_message.bind(this);
        this.send_message = this.send_message.bind(this);
        this.changeLocationWrapper = this.changeLocationWrapper.bind(this);
        this.handleClickLocation = this.handleClickLocation.bind(this);
        this.kickPerson = this.kickPerson.bind(this);

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
            if(event.code == 1001){
                // we are being kicked
                this.changeLocationWrapper("", "menu");
                return 
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
              is_game_started: message.is_game_started
            });
        }
    }

    changeUsername(username){
        this.setState({
            username: username,
        },
        this.joinRoom)
    }

    kickPerson(person){
        const player = this.state.players.filter(c => c.id == parseInt(person))[0];
        this.send_message({
            command: "kick_player",
            player: player,
        })
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
                kickPerson={this.kickPerson}
                is_game_started={this.state.is_game_started}
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
                    total_time={this.state.total_time}
                />
            );
        }
    }
}

export default SpyfallGameParent