import React, { Component } from "react";
import ReconnectingWebSocket from 'reconnecting-websocket'
import "./drawit.css"
import autobind from "autobind-decorator";
import DrawingCanvas from './drawingCanvas';
import {rainbow} from './utils';


function generate_websocket_path(room, kwargs){
    kwargs = kwargs || {};

    const ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
    const host =  window.location.host;
    const extra = "username=" + rainbow(20, Math.random() * 10).slice(1);
    //const path = (ws_scheme + '://' + host + '/ws/drawit/' + this.props.room + '/?' + extra);
    const path = (ws_scheme + '://' + host + '/ws/drawit/' + room + '/?' + extra);
    return path; 
}

@autobind
class WebSocketComponent extends Component{

    constructor(props){
        super(props);
        this.rws = null;
    }

    update_websocket(room, kwargs){
        let path = generate_websocket_path(room, kwargs)
        this.rws = new ReconnectingWebSocket(path);

        this.rws.onopen = (event) => {
            // console.log('WebSocket open', event);
            // this.send_message({ command: 'get_room' });
        };
        this.rws.onmessage = e => {
            // console.log("websocket on message", e.data);
            this.process_message(e.data)
        };

        this.rws.onerror = e => {
            console.log(e.message);
        };

        this.rws.onclose = (event) => {
            // console.log("WebSocket closed", event);
            if(event.code == 1000 && event.reason == "leave_lobby"){
                return // we are leaving 
            }
            if(event.code == 1001){
                // we are being kicked
                this.changeLocationWrapper("", "menu");
                return 
            }
        this.rws.reconnect();
        };
    }

    send_message(data){
        // console.log("sending ", data)
        this.rws.send(JSON.stringify({ ...data }));
      }
}


@autobind
class GameWrapper extends WebSocketComponent{
    constructor(props) {
        super(props);

        this.state = {
          in_lobby: true,
          location_state: "menu",
          word: this.props.word,
          player: {
              username: this.props.username,
              role: "",
          },
          players: [],
          round_time: this.props.seconds,
          is_guessing: false,
        };

        this.update_websocket("example")
        this.callbacks = {
            "player_kicked": {},
            "onmessage": {},
        };
    }

    launch_socket_callback(name, args){
        var callbacks = this.callbacks[name];
        // now we need to call these people
        _.forIn(callbacks, function(value, key) {
            // console.log("calling", key, args);
            value(args);
        });
    }

    register_socket_callbacks(cbname, name, callback){
        this.callbacks[name][cbname] = callback;
    }

    unregister_socket_callbacks(cbname, name){
        delete this.callbacks[name][cbname];
    }

    process_message(data) {
        const parsedData = JSON.parse(data);
        this.launch_socket_callback("onmessage", parsedData);
        return;

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
              is_game_started: message.is_game_started,
              total_time: (message.minutes * 60)
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

    changeLocationWrapper(location){
        console.log("need to fix chLwrapper", location)
        this.props.changeLocation(location)
        return; 
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
        return (
        <DrawingCanvas
            send_message={this.send_message}
            register_socket_callbacks={this.register_socket_callbacks}
            unregister_socket_callbacks={this.unregister_socket_callbacks}
            width= {document.width}
            height= {document.height}
            word={this.state.word}
            changeLocation={this.changeLocationWrapper}
            changeRoomCode={this.props.changeRoomCode}
        />
        );
    }
}

export default GameWrapper