import React, { Component } from "react";
import autobind from 'autobind-decorator'
import Icon from "@mdi/react";
import { mdiCurrencyUsd } from "@mdi/js";

const CALLBACK_NAME = "corp_game";

@autobind
class Game extends Component {
    constructor(props) {
      super(props);

      this.state = {
      }

      this.props.update_websocket("fakeroom", {username: "yeyeye"})
      this.props.register_socket_callbacks(CALLBACK_NAME, "onopen", this.on_open_handler);
      this.props.register_socket_callbacks(CALLBACK_NAME, "onmessage", this.process_message);
    }

    componentDidMount(){
        this.on_open_handler();
    }

    on_open_handler(event){
        this.props.send_message({ command: 'get_room' });
        this.props.send_message({ command: 'start_game' });
    }

    process_message(parsedData) {
        // dont care what message, just "done loading"
        if(this.state.is_loading){
            this.setState({
                is_loading: false
            })
        }

        const command = parsedData.command;
        const message = parsedData.message;
        const username = message.username;
        const sender = parsedData.sender;

        console.log("message", command, message, username, sender)

        let players = parsedData.message.players;
        if(players){
            players.forEach(
                (item) => {
                    if(item.channel == sender){
                        item.is_me = true;
                        this.setState({
                            "player": item
                        })
                    }
                }
            );
            const is_game_started = parsedData.message.is_game_started;
            this.props.updatePlayers(players);
            this.props.updateGameStarted(is_game_started);
        }

        let cards = parsedData.message.cards;
        if(cards){
            this.props.set_extra_game_state("cards", cards)
        }

    }

    onClickHandler(event){
      if (event.target == this.canvas) {
        event.preventDefault();
      }
      
      console.log("click event", event, event.target)
      while(event.target.getAttribute("name") === null){
        event.target = event.target.parentNode;
      }
      const button_ = event.target.getAttribute("name");

      console.log("button clicked", button_)
      switch(button_){
          case "room_leave":
            this.props.kill_websocket(this.props.username);
            this.props.changeLocation("home");
            this.props.clearGameState();
          break;
          case "room_end":
            this.props.send_message({
                command: "end_game"
            })
            this.props.changeLocation("lobby");
          break;
      }
    }

    componentWillUnmount() {
      this.props.unregister_socket_callbacks(CALLBACK_NAME, "onmessage")
    }

    render_player(player, i){
        console.log(player)
        return(
            <span key={player.username + i}>
            <p> Username: {player.username}</p>
            <p><Icon path={mdiCurrencyUsd} size={"1em"}/>{player.obj.money} million
            </p>
            </span>
        );
    }

    player_can_play(card){
        if(!this.state.player || this.state.player == null){
            return false;
        }
        if(this.state.player.obj.ap < card.apc){return false;}
        if(this.state.player.obj.money < card.mc){return false;}

        // also check if player played stock market before
        return true
    }
    render_employee(emp, i=0){
        if(!this.props.extra_game_state.cards){
            return <p key={emp + i}>{emp}</p>
        }
        console.log(this.props.extra_game_state.cards)
        const card = this.props.extra_game_state.cards[emp]
        
        return (
            <button key={emp + i} name={emp} disabled={!this.player_can_play(card)}style={{
                padding: "10px",
                margin: "auto",
                width: "50%",
            }}>
            <p key={emp + i}>
                {card.dname} <br/>AP: {card.apc} $: {card.mc}
            </p>
            </button>
        );
    }

    render_player_cards(){
        if(!this.state.player || this.state.player == null){
            return;
        }
        console.log(this.props.extra_game_state.cards)
        // apc: 1
        // attr: {}
        // dname: "Use Con-Man to steal from another company"
        // mc: 0
        // name: "conman"
        return (
            <>
            <p>Unused Action Points: {this.state.player.obj.ap}</p>
            <h2> Your Current Employee{this.state.player.obj.maxemp == 2? "s": ""}</h2>
            <div style={{
                display: "grid",
                justifyContent: "center",
            }}>
                {this.render_employee("stock_market", 0)}
                {this.render_employee("frame", 0)}
                {this.state.player.obj.emp.map(this.render_employee)}
            </div>
            </>
        )
    }

    render() {
      return (
        <React.Fragment>
            <h2> Players: </h2>
            {this.props.players.map(this.render_player)}
            {this.render_player_cards()}
            <hr/>
            <div style={{textAlign:"center"}}>
                <a name="room_end" className="button is-outlined button_style"
                    onClick={this.onClickHandler}>End Game</a>           
                <a name="room_leave" className="button is-outlined button_style" 
                    onClick={this.onClickHandler}>Leave Game</a>
            </div>
        </React.Fragment>
      );
    }
  }
  export default Game;