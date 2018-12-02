import React, { Component } from "react";
import ReactDOM from "react-dom";

const column_list = {
    columnCount: 2
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

        this.handleClick = this.handleClick.bind(this);
    }
    handleClick(event) {
        while(event.target.getAttribute("name") === null){
            event.target = event.target.parentNode;
        }
        console.log("button was clicked : " + event.target.getAttribute("name"));
    }
    renderPlayer(person){
        return <li key={person}>{person}</li>
    }

    renderPlace(place){
        return <li key={place}>{place}</li>
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

        let locations = [
            "Airplane",
            "Bank",
            "Beach",
            "Cathedral",
            "Circus Tent",
            "Corporate Party",
        ]

        let player = {
            location: null,
            role: "Spy",
            is_spy:true
        }

        if( Math.floor(Math.random()*100) % 2 == 0){
            player = {
                location: "Airplane",
                role: "Flight Attendant",
                is_spy: false
            }
        }
        let players = [
            "me",
            "you",
            "your data",
            "zaddy"
        ]
        return (
            <div>
                <div style={{textAlign:"center"}}>
                    <Timer minutes={12} seconds={34} />
                    <hr className="hrstyle"/>
                    {this.renderRole(player)}
                    <hr className="hrstyle"/>
                </div>
                
                    <h4>Players:</h4>
                    <ul style={column_list}>
                        {players.map( (person) => this.renderPlayer(person))}
                    </ul>
                    <h4>Location Reference: </h4>
                    <ul style={column_list}>
                        {locations.map( (place) => this.renderPlace(place))}
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