import React, { Component } from "react";
import ReactDOM from 'react-dom';
import windowSize from '../components/windowSize';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';


class Canvas extends Component {
    constructor(props) {
      super(props);

      this.mouse_clicked = false;
      this.past_positions = []

      this.onMouseDown = this.onMouseDown.bind(this);
      this.onMouseMove = this.onMouseMove.bind(this);
      this.onMouseUp = this.onMouseUp.bind(this);
      document.body.classList.add("no-sroll")
    }

    onMouseDown({ nativeEvent }) {
      const { offsetX: x, offsetY: y } = nativeEvent;
      console.log("im down", x, y);
      this.mouse_clicked = true;

      //always draw a dot on mouse down
      this.paint({x:x,y:y}, {x:x,y:y})
    }

    onMouseMove({ nativeEvent }) {
      const { offsetX: x, offsetY: y } = nativeEvent;
      if(this.mouse_clicked){
        let previous_position = this.past_positions.slice(-1)[0]
        // add to the list to send our boy
        this.past_positions.push({x:x,y:y})
        if(previous_position == undefined){
          previous_position = {x:x,y:y}   
        }

        this.paint(previous_position, {x:x,y:y})

      }
      console.log("im moving ", x, y, this.past_positions.length);
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
      this.mouse_clicked = false;
      this.past_positions = []
    }

    componentDidMount(){
      disableBodyScroll(this.canvas);

      this.canvas.width = 900;//this.props.width;
      this.canvas.height = 300;//this.props.height;
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
          style={{ background: 'black'}}
          onMouseDown={this.onMouseDown}
          onMouseLeave={this.onMouseUp}
          onMouseUp={this.onMouseUp}
          onMouseMove={this.onMouseMove}
        />
      );
    }
  }
  export default windowSize(Canvas);