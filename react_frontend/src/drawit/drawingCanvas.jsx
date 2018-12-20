import React, { Component } from "react";
import windowSize from '../components/windowSize';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import Button from '@material-ui/core/Button';
import autobind from 'autobind-decorator'

import Icon from "@mdi/react";
import { mdiPencil, mdiEraser, mdiClose, mdiConsoleLine } from "@mdi/js";
import { GithubPicker, SliderPicker, HuePicker, CustomPicker, ChromePicker} from 'react-color';
import {rainbow} from './utils';
import MyColorPicker from '../components/ColorPicker';
import VerticalSlider from '../components/VerticalSlider';
import SweetAlert from 'react-bootstrap-sweetalert';

const BACKGROUND = 'white'

const COLOR_CHOICES = ['#B80000', '#DB3E00', '#FCCB00', '#008B02', '#006B76', '#1273DE', '#004DCF', '#5300EB',
'#EB9694', '#FAD0C3', '#FEF3BD', '#C1E1C5', '#8B4513', 'white', '#C0C0C0', 'black'];//'#BED3F3', '#D4C4FB'];

const CLEAR = "__CLEAR"

let PENCIL = {
  name: "PENCIL",
  stroke: COLOR_CHOICES[0],
  lineWidth: 10,
}

const ERASER = {
  name: "ERASE",
  stroke: BACKGROUND,
  lineWidth: 15,
}


@autobind
class DrawingCanvas extends Component {
    constructor(props) {
      super(props);

      this.state = {
        is_loading: true,
        in_lobby: false,
        current_artist: null,
        is_local_player_artist: false,
        confirm_box: null, 
        _tool: PENCIL,
      }
      this._my_pencil = PENCIL
      this._my_eraser = ERASER

      this.numOfSteps = 10 // this would be set to num of players
      this.player_colors = {}
      this.mouse_clicked = false;
      this.past_positions = [];
      this.props.register_socket_callbacks("drawingCanvas", "onmessage", this.process_message)

      // why is this needed tho?
      this.props.send_message({
        command: "start_game"
      });
    }

    end_round(data, sender){
      this.clear_canvas();
      this.setState({
        confirm_box: null
      })
      this._my_pencil = PENCIL;
      this._my_eraser = ERASER;
      console.log("end round", data, sender)
      if(data.current_player >= data.players.length){
        // ran out of players
        this.props.send_message({
            command: "end_game"
        })
        return;
      }

      console.log("end_roundish", data.players, data.current_player)
      const player = data.players[data.current_player]

      this.setState({
        current_artist: player,
        is_local_player_artist: (player.channel == sender)
      })
    }

    process_message(parsedData) {
      console.log("drawing canvas process message", parsedData)
  
      // dont care what message, just "done loading"
      if(this.state.is_loading){
        this.setState({
          is_loading: false
        })
      }

      const command = parsedData.command;
      const username = parsedData.message.username;
      const sender = parsedData.sender;
      
      if(command == "start_game"){
        // start of game is kinda like switching rounds
        this.end_round(parsedData.message, sender)
      }
      if(command == "end_round"){
        this.end_round(parsedData.message, sender)
      }

      if(command == "end_game"){

        this.setState({
          confirm_box: null
        })
        this.props.updateGameStarted(false);
        this.props.changeLocation("_back");
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

    _paint(prev, cur, tool){
      const { x, y } = prev;
      const { x: x2, y: y2 } = cur;

      this.drawOutline(cur, tool)

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

    drawOutline(cur, tool){
      const {x, y} = cur;
      this.ctx.beginPath();
      this.ctx.arc(x, y, tool.lineWidth / 2, 0, 2 * Math.PI);
      this.ctx.fillStyle = tool.stroke;
      this.ctx.fill();
    }

    paint(prev, cur){
      if(!this.state.is_local_player_artist){
        // disable drawing when not local artist
        return; 
      }
      // console.log("paint", prev, cur, this.state._tool)
      let scaled_prev = {
        x: prev.x / this.props.windowWidth,
        y: prev.y / this.props.windowWidth,
      }
      let scaled_cur = {
        x: cur.x / this.props.windowWidth,
        y: cur.y / this.props.windowWidth,
      }

      this.props.send_message({
          command: "draw",
          message:{
            prev: scaled_prev,
            cur: scaled_cur,
            tool: this.state._tool,
          }
      });

      this._paint(prev, cur, this.state._tool)
    }

    clear_canvas(){
      // clear ourselves, and then send the clear on the bus
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.props.send_message({
        command: "draw",
        message:{
            prev: null,
            cur: null,
            tool: CLEAR,
          }
      });
    }

    onClickStringHandler(button_){
      switch(button_){
        case "pencil":
          // console.log("tool is now pencil")
          this.setState({_tool:this._my_pencil});
          break;
        case "eraser":
          // console.log("tool is now eraser")
          this.setState({_tool:this._my_eraser});
        break;
        case CLEAR:
          // console.log("clearing canvas")
          this.clear_canvas();
        break;
        case "end_round":
          if(this.state.current_artist != undefined){
            this.props.send_message({
              command: "end_round"
            })
          }
        break;
        case "end_game":
          if(this.state.current_artist != undefined){
            this.props.send_message({
              command: "end_game"
            })
            this.props.changeLocation("lobby");
          }
        break;
        case "exit_room":
          this.props.kill_websocket(this.props.username);
          this.props.changeLocation("home");
          this.props.clearGameState();
        break;
        default:
          console.log("button clicked but no handler", button_)
        break;
      }
    }

    closeConfirmBox(){
      this.setState({confirm_box: null})
    }

    onClickHandler(event){
      if (event.target == this.canvas) {
        event.preventDefault();
      }
      
      // console.log("click event", event, event.target)
      while(event.target.getAttribute("name") === null){
        event.target = event.target.parentNode;
      }
      const button_ = event.target.getAttribute("name");

      if(event.target.getAttribute("is_confirm") != "true"){
        return this.onClickStringHandler(button_);
      }

      const confirm_text = event.target.getAttribute("confirm_text");

      // otherwise lets draw the thing 
      this.setState({
          confirm_box: (
            <SweetAlert
                warning
                showCancel
                confirmBtnText={"Yes"}
                confirmBtnBsStyle="warning"
                cancelBtnBsStyle="default"
                title="Are you sure?"
                onConfirm={() => { this.onClickStringHandler(button_); this.closeConfirmBox() }}
                onCancel={ () => {this.closeConfirmBox()}}
                closeOnClickOutside={true}
                >
              {confirm_text}
              </SweetAlert>
          ),
      });
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
      position.x -= 25;
      position.y -= 30;
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


  // document.body.ontouchmove = (e) => { e.preventDefault; return false; };
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

    componentDidMount(){
      this.canvas.width = this.props.windowWidth;
      this.canvas.height = this.props.windowHeight;//*2;
      this.ctx = this.canvas.getContext('2d');
      this.ctx.lineJoin = 'round';
      this.ctx.lineCap = 'round';
      this.ctx.lineWidth = this.state._tool.lineWidth;
    }

    handleColorChange(color){
      //auto matically change to pencil and then change color
      // we dont want to keep on eraser and overwrite the black
      this._my_pencil.stroke = color.hex;
      this.setState({
        _tool: this._my_pencil
      });
    }

    componentWillUnmount() {
      clearAllBodyScrollLocks();
      this.props.unregister_socket_callbacks("drawingCanvas", "onmessage")
    }

    sliderChange(args){
      let my_tool = null;
      switch(this.state._tool.name){
        case PENCIL.name:
          this._my_pencil.lineWidth = args;
          my_tool = this._my_pencil;
        break;
        case ERASER.name:
          this._my_eraser.lineWidth = args;
          my_tool = this._my_eraser;
        break;
      }

      this.setState({
        _tool: my_tool
      });
    }

    render_tools(){
      return (
        <div id="button_bar" style={button_bar_style}>
          <Button name={CLEAR}
            onClick={this.onClickHandler} 
            style={tool_button_style}>
            <Icon path={mdiClose} size={1.5}/>
          </Button>
          <Button name="pencil" onClick={this.onClickHandler} style={tool_button_style}       
              {...(this.state._tool.name == PENCIL.name? {variant:"outlined" }: {})}
              >
            <Icon path={mdiPencil} size={1.5}/>
          </Button>
          <Button name="eraser" onClick={this.onClickHandler} style={tool_button_style}       
              {...(this.state._tool.name == ERASER.name? {variant:"outlined" }: {})}
              >
            <Icon path={mdiEraser} size={1.5}/>
          </Button>
          <div style={gh_style}>
              <div style={{position: "absolute", top: 5, left:0}}>
              <VerticalSlider
                min={2}
                max={50}
                step={2}
                value={this.state._tool.lineWidth}
                onChange={this.sliderChange}
              /> 
              </div>
              <div style={{position: "absolute", top: 5, right:-35}}>
             <GithubPicker
                width={40}
                color={ this.state._tool.stroke }
                colors={COLOR_CHOICES}
                onChangeComplete={ this.handleColorChange }
                triangle={"hide"}
              /> 
              </div>
          </div> 
        </div>
      );
    }

    render_text(text){
      return (
        <div style={{position: "inherit", display: "block", left: 40, margin: 3}}>
          <h1 style={{color: '#4a4a4a'}}>
            {text}
          </h1>
        </div>
      );
    }

    render_player_text(){
      return this.render_text(this.state.current_artist.username + " is drawing")
    }

    render_word_text(){
      return this.render_text(this.state.current_artist.word);
    }

    render_bottom_buttons(){
      return (
        <div style={room_button_holder}>
          <Button variant="outlined" 
            name="end_round" 
            is_confirm="true"
            confirm_text="Really end round?"
            onClick={this.onClickHandler} style={room_button_style}>
            Someone got it
          </Button>
          <Button variant="outlined" name="end_game" 
            is_confirm="true"
            confirm_text="Really end game?"
            onClick={this.onClickHandler} style={room_button_style}>
            End Game
          </Button>
          <Button variant="outlined" name="exit_room" 
            is_confirm="true"
            confirm_text="Really exit room?"
            onClick={this.onClickHandler} style={room_button_style}>
            Leave Game
          </Button>
        </div>
      );
    }

    render_artist_ui(){
      if(this.state.is_local_player_artist){
        return (
          <React.Fragment>
            {this.render_tools() }
            {this.render_word_text() }
          </React.Fragment>
        );
      }
      else if(this.state.current_artist != undefined){
        return (
          <React.Fragment>
            {this.render_player_text() }
          </React.Fragment>
        );
      }
      else{
        return (
          <React.Fragment>
            {this.render_text("Loading...")}
          </React.Fragment>
        );
      }

    }

    render() {
      // console.log(this.props);
      let is_artist_ui = this.render_artist_ui();
      
      return (
        <React.Fragment>
          { this.state.confirm_box != null && this.state.confirm_box}

          {is_artist_ui}
          {this.render_bottom_buttons() }
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
  export default windowSize(DrawingCanvas);

  const button_bar_style = {
    display: "block",
    position: "absolute",
    zIndex: "2",
    top: 120,
    left: -10,
    pointerEvents: "None",
    touchAction: "None",
    width: "100%",
  }
  const tool_button_style = {
    touchAction: "auto",
    pointerEvents: "auto",
    // margin: "5px",
    // left: 5,
    // width: "40px",
  }

  const room_button_holder = {
    position: "fixed",
    left: 0,
    bottom: 0,
    width: "100%",
  }
  const room_button_style = {
    touchAction: "auto",
    pointerEvents: "auto",
    width: "23.33%",
    margin: "5px",
    maxWidth: "150px",
    boxSizing:"border-box",
  }

  const gh_style = {
    touchAction: "auto",
    pointerEvents: "auto",
    width: "100%",
    display: "-webkit-box",
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