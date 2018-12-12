import React, { Component } from "react";
import windowSize from '../components/windowSize';
import { clearAllBodyScrollLocks } from 'body-scroll-lock';
import Button from '@material-ui/core/Button';
import autobind from 'autobind-decorator'

import ReconnectingWebSocket from 'reconnecting-websocket'
import {rainbow} from './utils'

const BACKGROUND = 'white'
const CLEAR = "__CLEAR"

@autobind
class GuessingCanvas extends Component {
    constructor(props) {
      super(props);

      this.state = {
        in_lobby: false
      }

      const ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
      const host =  window.location.host;
      // const extra = "username=" + this.props.username;
      const extra = "username=" + rainbow(this.numOfSteps*10, Math.random() * 10).slice(1);
      //const path = (ws_scheme + '://' + host + '/ws/drawit/' + this.props.room + '/?' + extra);
      var room = "room";
      const path = (ws_scheme + '://' + host + '/ws/drawit/' + room + '/?' + extra);
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
              // this.changeLocationWrapper("", "menu");
              return 
          }
        this.rws.reconnect();
      };
    }

    send_message(data){
      // console.log("sending ", data)
      this.rws.send(JSON.stringify({ ...data }));
    }

    process_message(data) {
      const parsedData = JSON.parse(data);
  
      const command = parsedData.command;
      const message = parsedData.message;
      const username = parsedData.message.username;
      // console.log("react recivied new message", command, message)
     
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

      // console.log(username, this.player_colors)

      if(command == "draw"){

        if(parsedData.message.tool == CLEAR){
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          return; 
        }
        
        if(!(username in this.player_colors))
        {
          // console.log("choosing new color")
          var new_color = rainbow(this.numOfSteps, Object.keys(this.player_colors).length);
          this.player_colors[username] = new_color
        }

        let upscaled_prev = {
            x: parsedData.message.prev.x * this.props.windowWidth,
            y: parsedData.message.prev.y * this.props.windowWidth
        }
        let upscaled_cur = {
          x: parsedData.message.cur.x * this.props.windowWidth,
          y: parsedData.message.cur.y * this.props.windowWidth
        }
        this._paint( upscaled_prev, upscaled_cur, parsedData.message.tool)
      }
    }

    _paint(prev, cur, tool){
      const { x, y } = prev;
      const { x: x2, y: y2 } = cur;

      this.ctx.beginPath();
      this.ctx.lineWidth = tool.lineWidth;
      this.ctx.strokeStyle = tool.stroke;
      // Move the the prevPosition of the mouse
      this.ctx.moveTo(x, y);
      // Draw a line to the current position of the mouse
      this.ctx.lineTo(x2, y2);
      // Visualize the line using the strokeStyle
      this.ctx.stroke();
    }

    onClickHandler(event){
      // console.log("click event", event, event.target)
      while(event.target.getAttribute("name") === null){
        event.target = event.target.parentNode;
      }
      const button_ = event.target.getAttribute("name")
    }

    componentDidMount(){
      this.canvas.width = this.props.windowWidth;
      this.canvas.height = this.props.windowHeight;
      this.ctx = this.canvas.getContext('2d');
      this.ctx.lineJoin = 'round';
      this.ctx.lineCap = 'round';
      this.ctx.lineWidth = 5;
    }

    componentWillUnmount() {
      clearAllBodyScrollLocks();
    }

    
    render() {
      console.log(this.props);
      return (
        <React.Fragment>
          <div id="button_bar" style={button_bar_style}>
            <Button variant="outlined" name="end_round" onClick={this.onClickHandler} style={button_style}>
              Someone got it
            </Button>
            <div style={{float: "right", display: "flex", left: 10, margin: 10}}>
              <b>WORD: </b>
              <h1 style={{color: 'black'}}>
                {this.props.word_length} letters
              </h1>
            </div>
          </div>

          <div style={canvas_wrapper}>
           <canvas
              style={canvas_style}
            // We use the ref attribute to get direct access to the canvas element. 
              ref={(ref) => (this.canvas = ref)}
              onMouseDown={this.onMouseDown}
              onMouseLeave={this.onMouseUp}
              onMouseUp={this.onMouseUp}
              onMouseMove={this.onMouseMove}
              onTouchStart={this.onTouchStart}
              onTouchEnd={this.onTouchEnd}
              onTouchMove={this.onTouchMove}
            > Your browser does not support the HTML 5 Canvas.  </canvas>
          </div>
        </React.Fragment>
      );
    }
  }
  export default windowSize(GuessingCanvas);

  const button_bar_style = {
    display: "block",
    position: "absolute",
    zIndex: "2",
    top: -40,
    // left: -30,
    left: -10,
    pointerEvents: "None",
    touchAction: "None",
  }
  const button_style = {
    touchAction: "auto",
    pointerEvents: "auto",
    left: -5,
    width: "40px",
  }

  const gh_style = {
    touchAction: "auto",
    pointerEvents: "auto",
    width: 40
  }

  const canvas_style = {
    background: BACKGROUND, 
    touchAction: "None",
    zIndex: "1",
    maxHeight: "inherit",
    maxWidth: "inherit",
  }

  const canvas_wrapper = {
    border: "2px black solid",
    width: "90%",
    height: "75%"
  }