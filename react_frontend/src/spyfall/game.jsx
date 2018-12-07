import React, { Component } from "react";
import Timer from '../components/Timer';
import "./spyfall.css"

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

export default SpyfallGame;