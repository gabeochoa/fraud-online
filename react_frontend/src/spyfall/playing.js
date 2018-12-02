import React, { Component } from "react";
import ReactDOM from "react-dom";

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

        let player = {location: null, role: "Spy", is_spy:true}

        if( Math.floor(Math.random()*100) % 2 == 0){
            player = {location: "Airplane", role: "Flight Attendant", is_spy: false}
        }

        this.state = {
            player: player,
            players: [
                { "name": "me", "is_first": false},
                { "name": "you", "is_first": true},
                { "name": "mom", "is_first": false},
                { "name": "dad", "is_first": false},
            ],
            locations: [
                ["Airplane", true],
                ["Bank", false],
                ["Beach", false],
                ["Cathedral", false],
                ["Circus Tent", false],
                ["Corporate Party", false],
            ],
        }

        this.handleClick = this.handleClick.bind(this);
        this.handleClickLocation = this.handleClickLocation.bind(this);
    }

    handleClickLocation(event){
        while(event.target.getAttribute("name") === null){
            event.target = event.target.parentNode;
        }
        const locations = [...this.state.locations]
        // find the matching object
        const location = this.state.locations.filter(c => c[0] == event.target.getAttribute("name"))[0];
        // index in our list 
        const index = this.state.locations.indexOf(location);
        locations[index] = [location[0], !location[1]];
        this.setState({locations});
    }

    handleClick(event) {
        while(event.target.getAttribute("name") === null){
            event.target = event.target.parentNode;
        }
        console.log("button was clicked : " + event.target.getAttribute("name"));
    }

    renderPlayer(person){
        let extra = <p></p>;
        if(person.is_first){
            extra = <sup style={{color:"red"}}> 1st</sup>
        }
        return (<li key={person.name} style={column_list_item}>
                    {person.name} {extra}
                </li>);
    }

    renderPlace(place){
        let place_text = null;
        if(place[1]){
            place_text =  <p style={{color: "#bbb", textDecoration: "line-through"}}> {place[0]} </p>
        }
        else{
            place_text = <p> {place[0]} </p>
        }
        return (<li key={place[0]} name={place[0]} onClick={this.handleClickLocation} style={column_list_item}>
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
                <p style={{textAlign:"center"}}>The location: {player.location}</p>
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
                    {this.renderRole(this.state.player)}
                    <hr className="hrstyle"/>
                </div>
                
                    <h4>Players:</h4>
                    <ul style={column_list}>
                        {this.state.players.map( (person) => this.renderPlayer(person))}
                    </ul>
                    <h4>Location Reference: </h4>
                    <ul style={column_list}>
                        {this.state.locations.map( (place) => this.renderPlace(place))}
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

export default SpyfallGame