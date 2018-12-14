import React, { Component } from "react";
import ReconnectingWebSocket from 'reconnecting-websocket'
import "./drawit.css"
import autobind from "autobind-decorator";
import DrawingCanvas from './drawingCanvas';
import GuessingCanvas from './guessingCanvas';

@autobind
class GameWrapper extends Component{
    constructor(props) {
        super(props);

        const ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
        const host =  window.location.host;
        const extra = ("username=" + this.props.username + 
                       "&" + "seconds=" + this.props.seconds
                        );
        const path = (ws_scheme + '://' + host + '/ws/drawit/' + this.props.room + '/?' + extra);

        this.state = {
          in_lobby: true,
          location_state: "menu",
          word: this.props.word,
          player: {
              username: this.props.username,
              role: "",
          },
          players: [],
          rws: new ReconnectingWebSocket(path),
          round_time: this.props.seconds,
          is_guessing: false,
        };
    

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
        if(this.state.is_guessing){
            return (
              <GuessingCanvas
              width={document.width}
              height={document.height}
              word_length={this.state.word.length}
              />
            )
          }
          else{
          return (
            <DrawingCanvas
              width= {document.width}
              height= {document.height}
              word={this.state.word}
            />
          );
        }
        // if(this.state.in_lobby){
        //     return (
        //     <SpyfallWaitingRoom 
        //         access_code={this.props.room}
        //         username={this.props.username}
        //         players={this.state.players}
        //         changeLocation={this.changeLocationWrapper}
        //         kickPerson={this.kickPerson}
        //         is_game_started={this.state.is_game_started}
        //         />)
        // }
        // else{
        //     return (
        //         <SpyfallGame
        //             players={this.state.players}
        //             player={this.state.player}
        //             locations={this.state.locations}
        //             handleClickLocation={this.handleClickLocation}
        //             changeLocation={this.changeLocationWrapper}
        //             total_time={this.state.total_time}
        //         />
        //     );
        //   }
    }
}

export default GameWrapper