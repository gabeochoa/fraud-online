import React, { Component } from "react";
import Button from '@material-ui/core/Button';
import autobind from 'autobind-decorator'

import Icon from "@mdi/react";
import { mdiPencil, mdiEraser, mdiClose} from "@mdi/js";
import { GithubPicker} from 'react-color';
import VerticalSlider from '../components/VerticalSlider';
import "../components/menu.css";
import "../drawit/drawit.css";

import TouchableCanvas from './TouchableCanvas';

const BACKGROUND = 'white'

const COLOR_CHOICES = ['black', '#C0C0C0', 'white', '#B80000', '#DB3E00', '#FCCB00', '#008B02', '#006B76', '#1273DE', '#004DCF', '#5300EB',
'#EB9694', '#FAD0C3', '#FEF3BD', '#C1E1C5', '#8B4513'];

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
class TooledTouchableCanvas extends Component{
    constructor(props){
        super(props);
        this.state = {
            tool: PENCIL
        }

        this.resetTools();

        this.touchable_canvas = React.createRef();
    }

    // FUNCTIONS TO FORWARD TO CHILD REF
    upscale_paint(a,b,c){
        this.touchable_canvas.upscale_paint(a,b,c);
    }

    clear_canvas(send_message){
        if(send_message == undefined){
            send_message = true;
        }
        this.touchable_canvas.clear_canvas(send_message);
    }
    /////////////////////////////////////

    resetTools(){
        this._my_eraser = ERASER;
        this._my_pencil = PENCIL;
    }

    onToolChanged(button_){
      switch(button_){
        case "pencil":
            // console.log("tool is now pencil")
            this.setState({tool:this._my_pencil});
            break;
        case "eraser":
            // console.log("tool is now eraser")
            this.setState({tool:this._my_eraser});
            break;
        case CLEAR:
            // console.log("clearing canvas")
            this.clear_canvas(true);
        break;
        default:
            console.warn("button clicked but no handler", button_)
        break;
      }
    }

    onClickHandler(event){
        while(event.target.getAttribute("name") === null){
            event.target = event.target.parentNode;
        }
        const button_ = event.target.getAttribute("name");

        this.onToolChanged(button_);
    }

    handleColorChange(color){
        //auto matically change to pencil and then change color
        // we dont want to keep on eraser and overwrite the black
        this._my_pencil.stroke = color.hex;
        this.setState({
            tool: this._my_pencil
        });
    }

    sliderChange(args){
        let my_tool = null;
        switch(this.state.tool.name){
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
          tool: my_tool
        });
    }

    render_tool_bar(){
        return(
            <React.Fragment>
            <Button name={CLEAR}
                onClick={this.onClickHandler} 
                style={tool_button_style}>
                <Icon path={mdiClose} size={"1em"}/>
            </Button>
            <Button name="pencil" onClick={this.onClickHandler} style={tool_button_style}       
                {...(this.state.tool.name == PENCIL.name? {variant:"outlined" }: {})}
                >
                <Icon path={mdiPencil} size={"1em"}/>
            </Button>
            <Button name="eraser" onClick={this.onClickHandler} style={tool_button_style}       
                {...(this.state.tool.name == ERASER.name? {variant:"outlined" }: {})}
                >
                <Icon path={mdiEraser} size={"1em"}/>
            </Button>
            </React.Fragment>
        );   
    }

    render_color_picker(){
        return(
            <React.Fragment>
            <div style={{position: "absolute", top: 5, right:0}}>
               <GithubPicker
                  width={40}
                  color={ this.state.tool.stroke }
                  colors={COLOR_CHOICES}
                  onChangeComplete={ this.handleColorChange }
                  triangle={"hide"}
                /> 
            </div>
            </React.Fragment>
        );   
    }

    render_slider(){
        return(
            <React.Fragment>
            <div style={{position: "absolute", top: 5, left:0}}>
                <VerticalSlider
                  min={2}
                  max={50}
                  step={2}
                  value={this.state.tool.lineWidth}
                  onChange={this.sliderChange}
                /> 
            </div>
            </React.Fragment>
        );   
    }

    render_tools(){
        return (
          <div id="button_bar" className="button_bar_style">
            {this.render_tool_bar()}
            <div style={gh_style}>
                {this.render_slider()}
                {this.render_color_picker()}
            </div> 
          </div>
        );
    }

    setTouchableRef(tref){
        this.touchable_canvas = tref;
    }

    render(){
        return (
            <React.Fragment>
                {this.props.is_local_player_artist && this.render_tools()}
                <TouchableCanvas
                    ref={this.setTouchableRef} 
                    is_local_player_artist={this.props.is_local_player_artist}
                    tool={this.state.tool}
                    send_message={this.props.send_message}
                />
            </React.Fragment>
        );
    }
}

export default TooledTouchableCanvas;


const tool_button_style = {
    touchAction: "auto",
    pointerEvents: "auto",
}

const gh_style = {
    touchAction: "auto",
    pointerEvents: "auto",
    width: "100%",
    display: "-webkit-box",
}
