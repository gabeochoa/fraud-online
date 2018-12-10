import React, { Component } from "react";
import ReactDOM from 'react-dom';
import windowSize from '../components/windowSize';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

import ReconnectingWebSocket from 'reconnecting-websocket'
import Icon from "@mdi/react";
import { mdiPencil, mdiEraser } from "@mdi/js";

function rainbow(numOfSteps, step) {
  // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
  // Adam Cole, 2011-Sept-14
  // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
  var r, g, b;
  var h = step / numOfSteps;
  var i = ~~(h * 6);
  var f = h * 6 - i;
  var q = 1 - f;
  switch(i % 6){
      case 0: r = 1; g = f; b = 0; break;
      case 1: r = q; g = 1; b = 0; break;
      case 2: r = 0; g = 1; b = f; break;
      case 3: r = 0; g = q; b = 1; break;
      case 4: r = f; g = 0; b = 1; break;
      case 5: r = 1; g = 0; b = q; break;
  }
  var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
  return (c);
}


const PENCIL = {
  stroke: 'red'
}

const ERASER = {
  stroke: 'black'
}

class Canvas extends Component {
    constructor(props) {
      super(props);

      this.state = {
        in_lobby: false
      }
      this.numOfSteps = 10 // this would be set to num of players
      this.player_colors = {}
      this.mouse_clicked = false;
      this.past_positions = [];
      this._tool = PENCIL;

      this.onMouseDown = this.onMouseDown.bind(this);
      this.onMouseMove = this.onMouseMove.bind(this);
      this.onMouseUp = this.onMouseUp.bind(this);

      this.onTouchEnd = this.onTouchEnd.bind(this);
      this.onTouchMove = this.onTouchMove.bind(this);
      this.onTouchStart = this.onTouchStart.bind(this);

      this.onEventBegin = this.onEventBegin.bind(this);
      this.onEventEnd = this.onEventEnd.bind(this);
      this.onEventMove = this.onEventMove.bind(this);
      
      this.send_message = this.send_message.bind(this);
      this.process_message = this.process_message.bind(this);

      this.onClickHandler = this.onClickHandler.bind(this);

      const ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
      const host =  window.location.host;
      // const extra = "username=" + this.props.username;
      const extra = "username=" + rainbow(this.numOfSteps*10, Math.random() * 10).slice(1);
      //const path = (ws_scheme + '://' + host + '/ws/drawit/' + this.props.room + '/?' + extra);
      var room = "room";
      const path = (ws_scheme + '://' + host + '/ws/drawit/' + room + '/?' + extra);
      this.rws = new ReconnectingWebSocket(path);

      this.rws.onopen = (event) => {
        console.log('WebSocket open', event);
        // this.send_message({ command: 'get_room' });
      };
      this.rws.onmessage = e => {
          console.log("websocket on message", e.data);
          this.process_message(e.data)
      };

      this.rws.onerror = e => {
          console.log(e.message);
      };

      this.rws.onclose = (event) => {
          console.log("WebSocket closed", event);
          if(event.code == 1000 && event.reason == "leave_lobby"){
              return // we are leaving 
          }
          if(event.code == 1001){
              // we are being kicked
              // this.changeLocationWrapper("", "menu");
              return 
          }
        this.rws.reconnect();
      };
    }



    send_message(data){
      console.log("sending ", data)
      this.rws.send(JSON.stringify({ ...data }));
    }

  process_message(data) {
      const parsedData = JSON.parse(data);
  
      const command = parsedData.command;
      const message = parsedData.message;
      const username = parsedData.message.username;
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

      console.log(username, this.player_colors)

      if(command == "draw"){
        
        if(!(username in this.player_colors))
        {
          console.log("choosing new color")
          var new_color = rainbow(this.numOfSteps, Object.keys(this.player_colors).length);
          this.player_colors[username] = new_color
        }

        this.paint(parsedData.message.prev, parsedData.message.cur, parsedData.message.stroke)
        // this.player_colors[username])
      }
      // //all commands
      // {
      //     let update_players = [...message.players]
      //     update_players.forEach((item)=>{
      //         if (item.channel == sender){
      //             item.is_me = true;
      //             this.setState({
      //                 player: item,
      //             })
      //         }
      //         else{
      //             item.is_me = false;
      //         }
      //     });

      //     let locations = this.state.locations;
      //     if(locations.length == 0){
      //         locations = [...message.locations].map((item)=>{return [item, false]})
      //     }
                      
      //     this.setState({
      //       players: update_players,
      //       locations: locations,
      //       is_game_started: message.is_game_started
      //     });
      // }
    }

    onEventBegin(x,y){
      this.mouse_clicked = true;
      //always draw a dot on mouse down
      this.paint({x:x,y:y}, {x:x,y:y})
      if(this.past_positions.length == 0){
        this.past_positions.push({x:x,y:y})
      }
    }

    onEventMove(x,y){     
      if(this.mouse_clicked){
        let previous_position = this.past_positions.slice(-1)[0]
        // add to the list to send our boy
        this.past_positions.push({x:x,y:y})
        if(previous_position == undefined){
            previous_position = {x:x,y:y}   
        }
        this.paint(previous_position, {x:x,y:y})
      }
    }

    onEventEnd(){
      this.mouse_clicked = false;
      this.past_positions = []
    }

    onMouseDown({ nativeEvent }) {
      const { offsetX: x, offsetY: y } = nativeEvent;
      // console.log("im down", x, y);
      this.onEventBegin(x,y)
    }

    onMouseMove({ nativeEvent }) {
      const { offsetX: x, offsetY: y } = nativeEvent;
      // console.log("im moving ", x, y, this.past_positions.length);
      this.onEventMove(x,y)
    }

    paint(prev, cur, stroke){
      console.log("paint", prev, cur, stroke)
      if(stroke == undefined){
          stroke = this._tool.stroke; //'#EE92C2'
          this.send_message({
            command: "draw",
            message:{
              prev: prev,
              cur: cur,
              stroke: this._tool.stroke,
            }
        })
        return;
      }
      const { x, y } = prev;
      const { x: x2, y: y2 } = cur;

      this.ctx.beginPath();
      this.ctx.strokeStyle = stroke;
      // Move the the prevPosition of the mouse
      this.ctx.moveTo(x, y);
      // Draw a line to the current position of the mouse
      this.ctx.lineTo(x2, y2);
      // Visualize the line using the strokeStyle
      this.ctx.stroke();
    }

    onClickHandler(event){
      const button_ = event.target.getAttribute("name")
      if(button_ == "pencil"){
        console.log("tool is now pencil")
        this._tool = PENCIL;
      }
      else if(button_ == "eraser"){
        console.log("tool is now eraser")
        this._tool = ERASER;
      }
    }

    onMouseUp(){
      this.onEventEnd()
    }
    
    onTouchStart(event){
      if (event.target == this.canvas) {
       event.preventDefault();
      }
      // console.log("touchstart", event)
      var rect = this.canvas.getBoundingClientRect();
      var x = event.touches[0].clientX - rect.left
      var y = event.touches[0].clientY - rect.top
      this.onEventBegin(x,y)
    }


  // document.body.ontouchmove = (e) => { e.preventDefault; return false; };
    onTouchEnd(event){
      if (event.target == this.canvas) {
       event.preventDefault();
      }
      // console.log("touchend", event)
      this.onEventEnd()
    }
    onTouchMove(event){
      if (event.target == this.canvas) {
        event.preventDefault();
      }
      // console.log("touchmove", event)
      var rect = this.canvas.getBoundingClientRect();
      var x = event.touches[0].clientX - rect.left
      var y = event.touches[0].clientY - rect.top
      this.onEventMove(x,y)
    }

    componentDidMount(){
      this.canvas.width = 1900;//this.props.width;
      this.canvas.height = 1300;//this.props.height;
      this.ctx = this.canvas.getContext('2d');
      this.ctx.lineJoin = 'round';
      this.ctx.lineCap = 'round';
      this.ctx.lineWidth = 5;
    }

    componentWillUnmount() {
      clearAllBodyScrollLocks();
    }

    render() {
      return (
        <React.Fragment>
          <button name="pencil" onClick={this.onClickHandler}>
            <Icon path={mdiPencil} size={1.5}/>
          </button>
          <button name="eraser" onClick={this.onClickHandler}>
            <Icon path={mdiEraser} size={1.5}/>
          </button>
        <canvas
        // We use the ref attribute to get direct access to the canvas element. 
          ref={(ref) => (this.canvas = ref)}
          style={{ background: 'black', touchAction: "None"}}
          onMouseDown={this.onMouseDown}
          onMouseLeave={this.onMouseUp}
          onMouseUp={this.onMouseUp}
          onMouseMove={this.onMouseMove}
          onTouchStart={this.onTouchStart}
          onTouchEnd={this.onTouchEnd}
          onTouchMove={this.onTouchMove}
        />
        </React.Fragment>
      );
    }
  }
  export default windowSize(Canvas);