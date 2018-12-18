import React, { Component } from "react";
import windowSize from '../components/windowSize';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import Button from '@material-ui/core/Button';
import autobind from 'autobind-decorator'

import ReconnectingWebSocket from 'reconnecting-websocket'
import Icon from "@mdi/react";
import { mdiPencil, mdiEraser, mdiClose } from "@mdi/js";
import { GithubPicker, CirclePicker } from 'react-color';
import {rainbow} from './utils';

const BACKGROUND = 'white'

const COLOR_CHOICES = ['#B80000', '#DB3E00', '#FCCB00', '#008B02', '#006B76', '#1273DE', '#004DCF', '#5300EB',
'#EB9694', '#FAD0C3', '#FEF3BD', '#C1E1C5', '#BEDADC', 'white', 'black'];//'#BED3F3', '#D4C4FB'];

const CLEAR = "__CLEAR"

let PENCIL = {
  stroke: COLOR_CHOICES[0],
  lineWidth: 10,
}

const ERASER = {
  stroke: BACKGROUND,
  lineWidth: 15,
}


@autobind
class DrawingCanvas extends Component {
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

    drawOutline(cur){
      const {x, y} = cur;
      this.ctx.beginPath();
      this.ctx.arc(x, y, this._tool.lineWidth, 0, 2 * Math.PI);
      this.ctx.fillStyle = 'white';//#40000';
      this.ctx.fill();
    }

    paint(prev, cur){
      // console.log("paint", prev, cur, this._tool)
      let scaled_prev = {
        x: prev.x / this.props.windowWidth,
        y: prev.y / this.props.windowWidth,
      }
      let scaled_cur = {
        x: cur.x / this.props.windowWidth,
        y: cur.y / this.props.windowWidth,
      }

      this.send_message({
          command: "draw",
          message:{
            prev: scaled_prev,
            cur: scaled_cur,
            tool: this._tool,
          }
      });

      this._paint(prev, cur, this._tool)
      // this.drawOutline(cur)
    }

    onClickHandler(event){
      if (event.target == this.canvas) {
        event.preventDefault();
      }
      // console.log("click event", event, event.target)
      while(event.target.getAttribute("name") === null){
        event.target = event.target.parentNode;
      }
      const button_ = event.target.getAttribute("name")
      if(button_ == "pencil"){
        console.log("tool is now pencil")
        this._tool = PENCIL;
      }
      else if(button_ == "eraser"){
        console.log("tool is now eraser")
        this._tool = ERASER;
      }
      else if(button_ == CLEAR){
        console.log("clearing canvas")
        this.send_message({
            command: "draw",
            message:{
              prev: null,
              cur: null,
              tool: CLEAR,
            }
        });
      }
    }

    onMouseUp(event){
      if (event.target == this.canvas) {
       event.preventDefault();
      }
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
      this.canvas.width = this.props.windowWidth;
      this.canvas.height = this.props.windowHeight;
      this.ctx = this.canvas.getContext('2d');
      this.ctx.lineJoin = 'round';
      this.ctx.lineCap = 'round';
      this.ctx.lineWidth = this._tool.lineWidth;
    }

    handleColorChange(color){
      //auto matically change to pencil and then change color
      // we dont want to keep on eraser and overwrite the black
      this._tool = PENCIL
      this._tool.stroke = color.hex;
    }

    componentWillUnmount() {
      clearAllBodyScrollLocks();
    }

    
    render() {
      console.log(this.props);
      return (
        <React.Fragment>
          <div id="button_bar" style={button_bar_style}>
            <Button name={CLEAR} onClick={this.onClickHandler} style={tool_button_style}>
              <Icon path={mdiClose} size={1.5}/>
            </Button>
            <Button name="pencil" onClick={this.onClickHandler} style={tool_button_style}>
              <Icon path={mdiPencil} size={1.5}/>
            </Button>
            <Button name="eraser" onClick={this.onClickHandler} style={tool_button_style}>
              <Icon path={mdiEraser} size={1.5}/>
            </Button>
            <div style={gh_style}>
              <GithubPicker
                width={40}
                color={ this._tool.stroke }
                colors={COLOR_CHOICES}
                onChangeComplete={ this.handleColorChange }
                triangle={"hide"}
                />
              </div>
          </div>
          <div style={{position: "absolute", display: "block", left: 40, margin: 10}}>
            <h1 style={{color: '#4a4a4a'}}>
              {this.props.word}
            </h1>
          </div>
          <div style={room_button_holder}>
            <Button variant="outlined" name="end_round" onClick={this.onClickHandler} style={room_button_style}>
              Someone got it
            </Button>
            <Button variant="outlined" name="exit_room" onClick={this.onClickHandler} style={room_button_style}>
              Leave Game
            </Button>
          </div>


          <div style={canvas_wrapper}>
           <canvas
              // width={this.props.windowWidth}
              // height={this.props.windowHeight}
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
  export default windowSize(DrawingCanvas);

  const button_bar_style = {
    display: "block",
    position: "absolute",
    zIndex: "2",
    top: 70,
    // left: -30,
    left: -10,
    pointerEvents: "None",
    touchAction: "None",
  }
  const tool_button_style = {
    touchAction: "auto",
    pointerEvents: "auto",
    margin: "5px",
    left: 5,
    width: "40px",
  }

  const room_button_holder = {
    position: "fixed",
    left: 20,
    bottom: -10,
  }
  const room_button_style = {
    touchAction: "auto",
    pointerEvents: "auto",
    margin: "5px",
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