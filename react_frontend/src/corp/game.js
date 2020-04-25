import React, { Component } from "react";
import autobind from 'autobind-decorator'
import Icon from "@mdi/react";
import { mdiCurrencyUsd, mdiArrowRight } from "@mdi/js";

const CALLBACK_NAME = "corp_game";

@autobind
class Game extends Component {
    constructor(props) {
      super(props);

      this.state = {
          player: null,
          current_player: null,
      }

      this.props.update_websocket("fakeroom3", {username: "yeyeye"})
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
                    if(message.current_player == item.order){
                        this.setState({
                            current_player: item
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

    card_play_handler(card){
        console.log(card)

        // certain cards have a target that they are played against. 
        // for right now we assume target is always None
        const target = null;

        if (this.props.extra_game_state.cards[card] == undefined){
            console.warn("this card ", card, "doesnt exist");
            return
        }
        this.props.send_message({
            "command": "play_card",
            "card": card,
            "target": target,
        })
    }

    onClickHandler(event){
      if (event.target == this.canvas) {
        event.preventDefault();
      }
      
    //   console.log("click event", event, event.target)
      while(event.target.getAttribute("name") === null){
        event.target = event.target.parentNode;
      }
      const button_ = event.target.getAttribute("name");
      console.log(event.target.getAttribute("disabled"));

    //   console.log("button clicked", button_)
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
          default:
            // we need to check if its a card
            this.card_play_handler(button_)
          break
      }
    }

    componentWillUnmount() {
      this.props.unregister_socket_callbacks(CALLBACK_NAME, "onmessage")
    }

    render_player(player, i){
        console.log(player)
        let bg_color = 'white';
        if(this.state.current_player && player.id == this.state.current_player.id){
            bg_color = 'white'
        }
        return(
            <div key={player.username + i} style={{
                background: bg_color
            }}>
                <p> 
                { this.state.current_player && player.id == this.state.current_player.id && 
                    <Icon path={mdiArrowRight} color="red" size={"1.5em"}/>
                }
                Username: {player.username}<Icon path={mdiCurrencyUsd} size={"1em"}/>{player.obj.money} million
                </p>
            </div>
        );
    }

    player_can_play(card, force_bad=false){
        if(!this.state.player || this.state.player == null || force_bad){
            return "bad";
        }
        if(this.state.player.obj.ap < card.apc){return "ap";}
        if(this.state.player.obj.money < card.mc){return "money";}
        // also check if player played stock market before
        return "good"
    }

    render_employee_disabled(emp, i=0, array, force_disabled=true){
        return this.render_employee(emp, i, array, force_disabled);
    }
    render_employee(emp, i=0, array, force_disabled=false){
        if(!this.props.extra_game_state.cards){
            return <p key={emp + i}>{emp}</p>
        }
        // console.log(this.props.extra_game_state.cards)
        const card = this.props.extra_game_state.cards[emp]
        const can_play = this.player_can_play(card, force_disabled)

        let ap_can_play = 'black'
        let mc_can_play = 'black'
        let text_can_play = 'black'
        if(can_play == "ap" || can_play == "money" || can_play == "bad"){
            ap_can_play = can_play == "ap"? 'red': 'graytext'
            mc_can_play = can_play == "money"? 'red': 'graytext'
            text_can_play = 'graytext'
        }

        const ap_style = {color: ap_can_play}
        const mc_style = {color: mc_can_play}
        const text_style = {color: text_can_play}
        const button_style = {padding: "10px", margin: "auto", width: "50%"}

    
        let ap_cost_text = <span style={ap_style}>AP: {card.apc}</span>;
        let money_cost_text = <span style={mc_style}>$: {card.mc}</span>;
        if(card.apc == 999){ 
            ap_cost_text = <span style={ap_style}>Card not offensive</span>;
            money_cost_text = <span></span>;
        }
        const button_text = <span style={text_style}>{card.dname}</span>
        const text_container = <p key={emp + i}> {button_text} <br/> {ap_cost_text} {money_cost_text}</p>
        // const button_disabled = true if should be disabled
        const button_disabled = force_disabled || can_play != "good"
        return (
            <button key={emp + i} name={emp} disabled={button_disabled}
                onClick={!button_disabled? this.onClickHandler: null}
                style={button_style}
            >
            {text_container}
            </button>
        );
    }

    render_player_cards(){
        if(!this.state.player || this.state.player == null){
            return;
        }
        if(this.state.player && this.state.current_player && this.state.player.id != this.state.current_player.id){
            console.log("current player is not the player on this screen ")
            return
        }
        // console.log(this.props.extra_game_state.cards)
        // apc: 1
        // attr: {}
        // dname: "Use Con-Man to steal from another company"
        // mc: 0
        // name: "conman"
        return (
            <>
            <h2> Your Current Employee{this.state.player.obj.maxemp == 2? "s": ""}</h2>
            <p>Unused Action Points: {this.state.player.obj.ap}</p>
            <div style={{
                display: "grid",
                justifyContent: "center",
            }}>
                {this.render_employee("stock_market", 0, false)}
                {this.render_employee("frame", 0, false)}
                {this.state.player.obj.emp.map(this.render_employee)}
            </div>
            <h2> Newly Drawn Cards</h2>
            <div style={{
                display: "grid",
                justifyContent: "center",
            }}>
                {this.state.player.obj.next.map(this.render_employee_disabled)}
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