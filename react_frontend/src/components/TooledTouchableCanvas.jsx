import React, { useState, useRef, useEffect, useCallback } from "react";
import Button from '@material-ui/core/Button';
import Icon from "@mdi/react";
import { mdiPencil, mdiEraser, mdiClose } from "@mdi/js";
import { GithubPicker } from 'react-color';
import VerticalSlider from '../components/VerticalSlider';
import "../components/menu.css";
import "../drawit/drawit.css";

import TouchableCanvas from './TouchableCanvas';

const BACKGROUND = 'white'
const COLOR_CHOICES = [
    'black', '#C0C0C0', 'white', '#B80000', '#DB3E00', '#FCCB00', '#008B02', '#006B76', '#1273DE', '#004DCF', '#5300EB',
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

const ToolBar = ({
    hideClearButton,
    onClickHandler,
    toolName,
}) => {
    const buttons = [
        { show: !hideClearButton, name: CLEAR, icon: mdiClose, },
        { show: true, name: "pencil", icon: mdiPencil, matchingName: PENCIL.name, },
        { show: true, name: "eraser", icon: mdiEraser, matchingName: ERASER.name, },
    ]
    return buttons.map(({ show, name, icon, matchingName }) => {
        if (!show) { return null; }
        return (
            <Button
                key={name}
                name={name}
                onClick={onClickHandler}
                style={tool_button_style}
                {...(toolName == matchingName ? { variant: "outlined" } : {})}
            >
                <Icon path={icon} size={"1em"} />
            </Button>
        );
    });
}

const TooledTouchableCanvas = (props) => {
    const [myPencil, setMyPencil] = useState(PENCIL);
    const [myEraser, setMyEraser] = useState(ERASER);
    const [tool, setTool] = useState(PENCIL);
    const [functions, setFunctions] = useState({});
    const touchable_canvas = useRef();

    const storeFunctions = (funcs) => {
        setFunctions(funcs);
        props.sendFunctions(funcs);
    }

    const onClickHandler = useCallback((event) => {
        while (event.target.getAttribute("name") === null) {
            event.target = event.target.parentNode;
        }
        const button_ = event.target.getAttribute("name");
        console.log("button was clicked: ", button_)
        switch (button_) {
            case "pencil": 
                setTool(myPencil); 
                break;
            case "eraser": 
                setTool(myEraser); 
                break;
            case CLEAR: 
                functions.clear_canvas(true); 
                break;
            default: console.warn("button clicked but no handler", button_); break;
        }
    }, [myPencil, myEraser, setTool, functions])

    const handleColorChange = (color) => {
        const newPencil = { ...myPencil, stroke: color.hex, };
        setMyPencil(newPencil)
        // automatically change to pencil and then change color
        // we dont want to keep on eraser and overwrite the black
        setTool(newPencil);
    }

    const sliderChange = (args) => {
        switch (tool.name) {
            case PENCIL.name: setMyPencil({ ...myPencil, lineWidth: args, }); break;
            case ERASER.name: setMyEraser({ ...myEraser, lineWidth: args, }); break;
        }
    }

    return (
        <>
            {props.is_local_player_artist &&
                props.render_tools != false &&
                <div id="button_bar" className="button_bar_style">
                    <ToolBar
                        hideClearButton={props.hideClearButton}
                        onClickHandler={onClickHandler}
                        toolName={tool.name}
                    />
                    <div style={gh_style}>
                        <div style={{ position: "absolute", top: 5, left: 0 }}>
                            <VerticalSlider
                                min={2}
                                max={50}
                                step={2}
                                value={tool.lineWidth}
                                onChange={sliderChange}
                            />
                        </div>
                        <div style={{ position: "absolute", top: 5, right: 0 }}>
                            <GithubPicker
                                width={40}
                                color={tool.stroke}
                                colors={COLOR_CHOICES}
                                onChangeComplete={handleColorChange}
                                triangle={"hide"}
                            />
                        </div>
                    </div>
                </div>
            }
            <TouchableCanvas
                ref={touchable_canvas}
                sendFunctions={storeFunctions}
                is_local_player_artist={props.is_local_player_artist}
                tool={tool}
                send_message={props.send_message}
            />
        </>
    );
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
