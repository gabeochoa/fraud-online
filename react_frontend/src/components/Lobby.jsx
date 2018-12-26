import React, {Component} from "react";
import autobind from 'autobind-decorator';
import PropTypes from 'prop-types';
import Icon from '@mdi/react'
import { mdiDelete, mdiPen } from '@mdi/js'
import "./menu.css";

class SizeZeroIcon extends Component{
    render(){
        return (
            <div style={{fontSize:0}}>
                <Icon {...this.props}></Icon>
            </div>
        );
    }
}


@autobind
class Lobby extends Component{

    constructor(props){
        super(props);

        this.state = {
            is_loaded: false,
        }
    }

    componentDidMount(){
        // connect to the room that we are trying to join
        const kwargs = {
            username: this.props.username,
        }
        if(this.props.socket_null()){
            this.props.update_websocket(this.props.room_code, kwargs);
        }
        this.setState({
            is_loaded: true
        })
        this.props.register_socket_callbacks("lobby", "onmessage", this.process_message);
        this.props.register_socket_callbacks("lobby", "player_kicked", this.leave_lobby);
    }

    componentWillUnmount(){
        this.props.unregister_socket_callbacks("lobby", "onmessage");
        this.props.unregister_socket_callbacks("lobby", "player_kicked");
    }

    leave_lobby(){
        try {
            this.props.changeLocation("home");
        } catch (error) {console.warn(error, "failed to change location")}
        try {
            this.props.clearGameState();
        } catch (error) { console.warn(error, "failed to clear state ")}
        try{
            this.props.kill_websocket(this.props.username);
        } catch (error) { console.warn(error, "failed to kill")}
    }

    process_message(parsedData){
        console.log("Lobby process_message", parsedData);

        if(!this.state.is_loaded){
            this.setState({is_loaded:true})
        }
        const command = parsedData.command;
        const sender = parsedData.sender;
        if(command == "get_room_response"){
            let players = parsedData.message.players;
            players.forEach(
                (item) => {
                    if(item.channel == sender){
                        item.is_me = true;
                    }
                }
            );
            const is_game_started = parsedData.message.is_game_started;
            this.props.updatePlayers(players);
            this.props.updateGameStarted(is_game_started);
        }
        else if(command == "start_game"){
            let players = parsedData.message.players;
            players.forEach(
                (item) => {
                    if(item.channel == sender){
                        item.is_me = true;
                    }
                }
            );
            const is_game_started = parsedData.message.is_game_started;
            this.props.updatePlayers(players);
            this.props.updateGameStarted(is_game_started);
            this.props.changeLocation("game")
        }
        else if(command == "end_game"){
            let players = parsedData.message.players;
            players.forEach(
                (item) => {
                    if(item.channel == sender){
                        item.is_me = true;
                    }
                }
            );
            const is_game_started = parsedData.message.is_game_started;
            this.props.updatePlayers(players);
            this.props.updateGameStarted(is_game_started);
        }
    }

    handleClick(event){
        while(event.target.getAttribute("name") === null){
            event.target = event.target.parentNode;
        }
        let button = event.target.getAttribute("name");
        console.log("button was clicked : " + button);
        switch(button){
            case "lobby_start":
                if( (!this.props.is_game_started) && this.state.is_loaded){
                    this.props.send_message({
                      command: "start_game"
                    });
                    this.props.changeLocation("game");
                }
            break;
            case "lobby_leave":
                this.leave_lobby()
            break;
            case "edit_name":
                this.props.kill_websocket(this.props.username);
                this.props.changeLocation("join");
            break;
            case "kick_person":
                if(!this.props.is_game_started){
                    this.props.kickPlayer(event.target.getAttribute("player"));
                }
            break;
            default:
            console.log("default case");
            break
        }
    }

    render_person(person){
        let icon = <SizeZeroIcon name={icon_name} player={person.id} path={mdiDelete} size={1} />
        let icon_name = "kick_person"
        if(person.is_me){
            icon_name = "edit_name"
            icon = <SizeZeroIcon name={icon_name} path={mdiPen} size={1}/>
        }
        
        return (
            <li key={person.id} style={{display:"float",  marginBottom:5}}>
                <h1 style={{float: "left", paddingLeft:5, wordWrap: "break-word"}}>
                        {person.username} 
                </h1>
                <div style={{float: "right"}} player={person.id} name={icon_name} onClick={this.handleClick}> 
                    {icon}
                </div>
            </li>
        );
    }


    render(){
        let header = "Game is already in progress";
        if(!this.props.is_game_started){
            header = "Waiting for players...";
        }

        return (
            <React.Fragment>
                <div className="div_set">
                    <h4 className="lobby_font">{header}</h4>
                    <h5>Room Code: {this.props.room_code}</h5>
                    <hr className="hrstyle"/>
                    <div>
                        <ol className="olstyle">
                            {this.props.players.map((item) => this.render_person(item))}
                        </ol>
                    </div>
                    <hr className="hrstyle"/>
                    <div className="field is-centered" >
                        <a name="lobby_start" className="button is-outlined button_style button_font"
                            onClick={this.handleClick}
                            style={button_stretch}
                            >Start Game</a>           
                        <a name="lobby_leave" className="button is-outlined button_style button_font" 
                            onClick={this.handleClick}
                            style={button_stretch}
                            >Leave Game</a>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

const button_stretch = {
    width: "40%", // 1/X where x is num of buttons
}


Lobby.propTypes = {
    changeLocation: PropTypes.func,
    rws: PropTypes.any, // needs to be socket item
    room_code: PropTypes.string,
}

export default Lobby;