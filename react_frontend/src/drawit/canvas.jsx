import React, { Component } from "react";
import ReactDOM from 'react-dom';
import windowSize from '../components/windowSize';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

import ReconnectingWebSocket from 'reconnecting-websocket'


class Canvas extends Component {
    constructor(props) {
      super(props);

      this.mouse_clicked = false;
      this.past_positions = []

      this.onMouseDown = this.onMouseDown.bind(this);
      this.onMouseMove = this.onMouseMove.bind(this);
      this.onMouseUp = this.onMouseUp.bind(this);

      this.onTouchEnd = this.onTouchEnd.bind(this);
      this.onTouchMove = this.onTouchMove.bind(this);
      this.onTouchStart = this.onTouchStart.bind(this);

      this.onEventBegin = this.onEventBegin.bind(this);
      this.onEventEnd = this.onEventEnd.bind(this);
      this.onEventMove = this.onEventMove.bind(this);

      const ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
      const host =  window.location.host;
      // const extra = "username=" + this.props.username;
      const extra = "username=" + "myusername";
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
          // this.process_message(e.data)
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

    onEventBegin(x,y){
      this.mouse_clicked = true;
      //always draw a dot on mouse down
      this.paint({x:x,y:y}, {x:x,y:y})
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

    paint(prev, cur, stroke='#EE92C2'){
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

    onMouseUp(){
      this.onEventEnd()
    }
    
    onTouchStart(event){
      if (event.target == canvas) {
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
      if (event.target == canvas) {
       event.preventDefault();
      }
      // console.log("touchend", event)
      this.onEventEnd()
    }
    onTouchMove(event){
      if (event.target == canvas) {
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
      );
    }
  }
  export default windowSize(Canvas);