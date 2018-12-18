import React, {Component} from "react";
import autobind from 'autobind-decorator';
import PropTypes from 'prop-types';
import {rainbow} from '../drawit/utils';
import ReconnectingWebSocket from 'reconnecting-websocket';

const FIRST_ELEM = "__DEFAULT__";

function generate_websocket_path(room, kwargs){
    console.log("websocket path, ", room, kwargs)
    kwargs = kwargs || {};

    const ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
    const host =  window.location.host;
    const extra = "username=" + (kwargs.username || rainbow(20, Math.random() * 10).slice(1));
    //const path = (ws_scheme + '://' + host + '/ws/drawit/' + this.props.room + '/?' + extra);
    const path = (ws_scheme + '://' + host + '/ws/drawit/' + room + '/?' + extra);
    return path; 
}

@autobind
class WebSocketComponent extends Component{

    constructor(props){
        super(props);

        this.rws = null;
        this.was_open = false;
        this.callbacks = {
            "player_kicked": {},
            "onmessage": {},
        };
    }

    update_websocket(room, kwargs){
        let path = generate_websocket_path(room, kwargs)
        this.rws = new ReconnectingWebSocket(path);

        this.rws.onopen = (event) => {
            if(this.was_open){
                console.log("websocket was already open, and now open again")
            }
            console.log('WebSocket open', event);
            this.was_open = true;
            this.launch_socket_callback("onopen", event);
        };
        this.rws.onmessage = e => {
            // console.log("websocket on message", e.data);
            this.process_message(e.data)
        };

        this.rws.onerror = e => {
            console.log(e.message);
            this.launch_socket_callback("onerror", e);
        };

        this.rws.onclose = (event) => {
            console.log("WebSocket closed", event);
            if(event.code == 1000 && event.reason == "leave_lobby"){
                return // we are leaving 
            }
            if(event.code == 1001){
                // we are being kicked
                this.changeRoomCode("")
                this.changeLocation("home");
                this.launch_socket_callback("player_kicked", event);
                return 
            }
            this.was_open = false;
            this.rws.reconnect();
        };
    }

    socket_null(){
        return (this.rws == null)
    }

    kill_websocket(username){
        this.send_message({
            command:  "leave_lobby",
            username: username,
        });
        this.rws.close(1000, "leave_lobby");
        this.rws = null;
    }

    send_message(data){
        // console.log("sending ", data)
        this.rws.send(JSON.stringify({ ...data }));
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

    process_message(data){
        const parsedData = JSON.parse(data);
        this.launch_socket_callback("onmessage", parsedData);
    }
}

const _starting_game_state = {
    username: "",
    room_code: "",
    players: [],
    is_game_started: false,
}

@autobind
class Menu extends WebSocketComponent {

    constructor(props){
        super(props);
        console.log(props)

        this.prev_locations = [FIRST_ELEM, this.props.starting_location]

        this.state = {
            location: this.props.starting_location,
            ..._starting_game_state,
        }
    }

    clearGameState(args){
        this.setState({
            ..._starting_game_state
        })
    }

    changeLocation(new_location, callback){
        if(callback == undefined){
            callback = ()=>{};
        }
        console.log("change location", this.state.location, new_location);

        if(new_location == "_back"){
            // user wants to go back from here 
            // bring them to the previous place
            let prev_location = this.prev_locations.pop();
            if(prev_location == FIRST_ELEM){
                // we are at the root menu, do nothing
                this.prev_locations.push(FIRST_ELEM)
                return
            }
            // otherwise, we need to just send the user to the new place
            this.setState({
                location: prev_location
            }, callback)
            return
        }
        // if they arent going back, lets add the location to our stack
        // then send the user there. 
        this.prev_locations.push(this.state.location);
        this.setState({
            location: new_location
        }, callback);
    }

    changeRoomCode(room_code, callback){
        this.setState({
            room_code: room_code,
        },
        callback)
    }

    changeUsername(username, callback){
        this.setState({
          username: username,
        },
        callback)
    }

    updatePlayers(players){
        this.setState({
            players: players,
        })
    }

    updateGameStarted(newstate){
        this.setState({
            is_game_started: newstate,
        })
    }

    kickPlayer(person){
        const player = this.state.players.filter(c => c.id == parseInt(person))[0];
        console.log("kicking player: ", person, this.state.players, player);
        this.send_message({
            command: "kick_player",
            player: player,
        })
    }

    componentDidMount(){
        this.register_socket_callbacks("_MENU", "player_kicked", this.clearGameState);
    }
    componentWillUnmount(){
        this.unregister_socket_callbacks("_MENU", "player_kicked");
    }
    

    render(){
        let content = <p>DEFAULT CASE</p>;
        if(this.state.location == undefined){
            return content;
        }
        const iteritems = Object.entries(this.props.all_locations);
        for (let [key, value] of iteritems){
            // console.log(key, this.state.location)
            if(key == this.state.location){
                content = value;
                break;
            }
        }
        const child_props = {
            // ...this.props,
            // attribute props
            username: this.state.username,
            room_code: this.state.room_code,
            players: this.state.players,
            is_game_started: this.state.is_game_started,
            // function props
            changeLocation: this.changeLocation,
            update_websocket: this.update_websocket,
            kill_websocket: this.kill_websocket,
            register_socket_callbacks: this.register_socket_callbacks,
            unregister_socket_callbacks: this.unregister_socket_callbacks,
            changeRoomCode: this.changeRoomCode,
            changeUsername: this.changeUsername,
            send_message: this.send_message,
            updateGameStarted: this.updateGameStarted,
            updatePlayers: this.updatePlayers,
            kickPlayer: this.kickPlayer,
            clearGameState: this.clearGameState,
            socket_null: this.socket_null,
        }
        const matching_props = child_props;
        return (
            <div id="button_bar" className="field is-centered button_bar_style">
                {this.props.header}
                {React.cloneElement(content, matching_props)}
                {this.props.footer}
            </div>
        );
    }
}

Menu.propTypes = {
    start_location: PropTypes.string,
    all_locations: PropTypes.object,
}

export default Menu;