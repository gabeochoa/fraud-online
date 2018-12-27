import React, { Component } from "react";
import autobind from 'autobind-decorator'
import "../components/menu.css";
import "../drawit/drawit.css";
import BaseCanvas from './BaseCanvas';

const CLEAR = "__CLEAR"

let CANVAS = {
  width: 1000,
  height: 1000
}


@autobind
class TouchableCanvas extends Component{

    constructor(props){
        super(props);
        this.past_positions = []
        this.mouse_clicked = false;
        this.ctx = null;
        this.canvas = null;
    }

    componentDidMount(){
        this.canvas.height = this.canvas.clientHeight;
        this.canvas.width = this.canvas.clientWidth;
        CANVAS.width = this.canvas.width;
        CANVAS.height = this.canvas.height;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        this.ctx.lineWidth = this.props.tool.lineWidth;
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
        // console.log(this.past_positions)
        // console.log(this.past_positions.length)
        if(this.past_positions.length == 1){
            // this is a dot boi
            this.paint(this.past_positions[0], this.past_positions[0])
        }
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

    onMouseUp(event){
        if (event.target == this.canvas) {
            event.preventDefault();
        }
        this.onEventEnd()
    }
    
    normalizeTouchLocation(evt, parent){
        var position = {};
        
        position.x = event.touches[0].clientX;
        position.y = event.touches[0].clientY; 
        position.x -= parent.offsetLeft - parent.scrollLeft;
        position.y -= parent.offsetTop - parent.scrollTop;
        return position;
    }

    onTouchStart(event){
        if (event.target == this.canvas) {
            event.preventDefault();
        }
        const {x, y} = this.normalizeTouchLocation(event, this.canvas);
        // console.log("touchstart", x, y)
        this.onEventBegin(x,y)
    }

    onTouchEnd(event){
        if (event.target == this.canvas) {
            event.preventDefault();
        }
        // console.log("touchend", event, event.touches, event.touches[0])
        this.onEventEnd()
    }

    onTouchMove(event){
        if (event.target == this.canvas) {
            event.preventDefault();
        }
        const {x, y} = this.normalizeTouchLocation(event, this.canvas);
        // console.log("touchmove", x, y)
        this.onEventMove(x,y)
    }
  
    _scale_coord(coord){
        return {
            x: coord.x / CANVAS.width,
            y: coord.y / CANVAS.height
        }
    }
    _upscale_coord(coord){
        return {
            x: coord.x * CANVAS.width,
            y: coord.y * CANVAS.height
        }
    }

    clear_canvas(send_message){
        // clear ourselves, and then send the clear on the bus
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if(send_message){
            this.props.send_message({
                command: "draw",
                message:{
                    prev: null,
                    cur: null,
                    tool: CLEAR,
                }
            });
        }
    }

    _paint(prev, cur, tool){
        // console.log("_paint", prev, cur, tool);
        const { x, y } = prev;
        const { x: x2, y: y2 } = cur;

        this._drawOutline(cur, tool)

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

    _drawOutline(cur, tool){
        const {x, y} = cur;
        this.ctx.beginPath();
        this.ctx.arc(x, y, tool.lineWidth / 2, 0, 2 * Math.PI);
        this.ctx.fillStyle = tool.stroke;
        this.ctx.fill();
    }

    upscale_paint(prev, cur, tool){
        if(tool == CLEAR){
            this.clear_canvas();
            return;
        }
        let upscaled_prev = this._upscale_coord(prev);
        let upscaled_cur = this._upscale_coord(cur);
        let upscaled_tool = {...tool}
        upscaled_tool.lineWidth = Math.max(1, upscaled_tool.lineWidth * CANVAS.height);
        this._paint(upscaled_prev, upscaled_cur, upscaled_tool)
    }

    paint(prev, cur){
        // console.log("paint", prev, cur, this.props.is_local_player_artist)
        if(!this.props.is_local_player_artist){
            return; // disable drawing when not local artist
        }
        // console.log("paint", prev, cur, this.props.tool)
        let scaled_prev = this._scale_coord(prev);
        let scaled_cur = this._scale_coord(cur);
        let scaled_tool = {... this.props.tool}
        scaled_tool.lineWidth = this.props.tool.lineWidth / CANVAS.height;

        this.props.send_message({
            command: "draw",
            message:{
                prev: scaled_prev,
                cur: scaled_cur,
                tool: scaled_tool,
            }
        });

        this._paint(prev, cur, this.props.tool)
    }

    render(){
        return  (
            <BaseCanvas
                setCanvas={(canvas_ref)=> this.canvas = canvas_ref}
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

export default TouchableCanvas;