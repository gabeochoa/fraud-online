import React, { useRef, useEffect } from "react";
import "../components/menu.css";
import "../drawit/drawit.css";

const CLEAR = "__CLEAR"

let CANVAS = {
    width: 1000,
    height: 1000
}

const normalizeTouchLocation = (evt, parent) => {
    var position = {};
    position.x = event.touches[0].clientX;
    position.y = event.touches[0].clientY;
    position.x -= parent.offsetLeft - parent.scrollLeft;
    position.y -= parent.offsetTop - parent.scrollTop;
    return position;
}

const _scale_coord = (coord) => {
    return {
        x: coord.x / CANVAS.width,
        y: coord.y / CANVAS.height
    }
}

const _upscale_coord = (coord) => {
    return {
        x: coord.x * CANVAS.width,
        y: coord.y * CANVAS.height
    }
}

const TouchableCanvas = (props) => {
    let past_positions = []
    let mouse_clicked = false;
    let ctx = null;
    const canvas = useRef();

    useEffect(() => {
        canvas.current.height = canvas.current.clientHeight;
        canvas.current.width = canvas.current.clientWidth;
        CANVAS.width = canvas.current.width;
        CANVAS.height = canvas.current.height;
        ctx = canvas.current.getContext('2d');
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = props.tool.lineWidth;
    });

    const onEventMove = (x,y) => {     
        if(mouse_clicked){
            let previous_position = past_positions.slice(-1)[0]
            // add to the list to send our boy
            past_positions.push({x:x,y:y})
            if(previous_position == undefined){
                previous_position = {x:x,y:y}   
            }
            paint(previous_position, {x:x,y:y})
        }
    }

    const onEventBegin = (x,y) => {
        mouse_clicked = true;
        //always draw a dot on mouse down
        paint({x:x,y:y}, {x:x,y:y})
        if(past_positions.length == 0){
            past_positions.push({x:x,y:y})
        }
    }

    const onEventEnd = () => {
        if (past_positions.length == 1) {
            // this is a dot boi
            paint(past_positions[0], past_positions[0])
        }
        mouse_clicked = false;
        past_positions = []
    }

    const onMouseDown = ({ nativeEvent }) => {
        const { offsetX: x, offsetY: y } = nativeEvent;
        // console.log("im down", x, y);
        onEventBegin(x, y)
    }

    const onMouseMove = ({ nativeEvent }) => {
        const { offsetX: x, offsetY: y } = nativeEvent;
        // console.log("im moving ", x, y, this.past_positions.length);
        onEventMove(x, y)
    }

    const onMouseUp = (event) => {
        if (event.target == canvas) {
            event.preventDefault();
        }
        onEventEnd()
    }

    const onTouchStart = (event) => {
        if (event.target == canvas) {
            event.preventDefault();
        }
        const { x, y } = normalizeTouchLocation(event, canvas);
        // console.log("touchstart", x, y)
        onEventBegin(x, y)
    }

    const onTouchEnd = (event) => {
        if (event.target == canvas) {
            event.preventDefault();
        }
        // console.log("touchend", event, event.touches, event.touches[0])
        onEventEnd()
    }

    const onTouchMove = (event) => {
        if (event.target == canvas) {
            event.preventDefault();
        }
        const { x, y } = normalizeTouchLocation(event, canvas);
        // console.log("touchmove", x, y)
        onEventMove(x, y)
    }


    const _paint = (prev, cur, tool) => {
        console.log("_paint", prev, cur, tool);
        const { x, y } = prev;
        const { x: x2, y: y2 } = cur;
        _drawOutline(cur, tool)
        ctx.beginPath();
        ctx.lineWidth = tool.lineWidth;
        ctx.strokeStyle = tool.stroke;
        // Move the the prevPosition of the mouse
        ctx.moveTo(x, y);
        // Draw a line to the current position of the mouse
        ctx.lineTo(x2, y2);
        // Visualize the line using the strokeStyle
        ctx.stroke();
    }

    const _drawOutline = (cur, tool) => {
        const { x, y } = cur;
        ctx.beginPath();
        ctx.arc(x, y, tool.lineWidth / 2, 0, 2 * Math.PI);
        ctx.fillStyle = tool.stroke;
        ctx.fill();
    }

    const paint = (prev, cur) => {
        console.log("paint", prev, cur, props.is_local_player_artist)
        if (!props.is_local_player_artist) {
            return; // disable drawing when not local artist
        }
        console.log("paint", prev, cur, props.tool)
        let scaled_prev = _scale_coord(prev);
        let scaled_cur = _scale_coord(cur);
        let scaled_tool = { ...props.tool }
        scaled_tool.lineWidth = props.tool.lineWidth / CANVAS.height;
        props.send_message({
            command: "draw",
            message: { prev: scaled_prev, cur: scaled_cur, tool: scaled_tool, }
        });
        _paint(prev, cur, props.tool)
    }

    // FUNCTIONS TO FORWARD TO CHILD REF
    const upscale_paint = (prev, cur, tool) => {
        if (tool == CLEAR) { clear_canvas(); return; }
        let upscaled_prev = _upscale_coord(prev);
        let upscaled_cur = _upscale_coord(cur);
        let upscaled_tool = { ...tool }
        upscaled_tool.lineWidth = Math.max(1, upscaled_tool.lineWidth * CANVAS.height);
        _paint(upscaled_prev, upscaled_cur, upscaled_tool)
    }

    const clear_canvas = (send_message) => {
        if (send_message == undefined) { send_message = true; }
        // clear ourselves, and then send the clear on the bus
        ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
        if (send_message) {
            props.send_message({
                command: "draw",
                message: { prev: null, cur: null, tool: CLEAR, }
            });
        }
    }
    useEffect(() => {
        props.sendFunctions({ upscale_paint, clear_canvas })
    }, []);
    /////////////////////////////////////

    return (
        <div className="canvas_wrapper_wrapper">
            <div className="canvas_wrapper">
                <canvas
                    className="canvas_style"
                    // We use the ref attribute to get direct access to the canvas element. 
                    ref={canvas}
                    onMouseDown={onMouseDown}
                    onMouseLeave={onMouseUp}
                    onMouseUp={onMouseUp}
                    onMouseMove={onMouseMove}
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                    onTouchMove={onTouchMove}
                >
                    Your browser does not support the HTML 5 Canvas.
                </canvas>
            </div>
        </div>
    );
}

/*

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
*/

export default TouchableCanvas;