import React from "react";
import "../components/menu.css";
import "../drawit/drawit.css";

const BaseCanvas = (props) => {
    return (
        <div className="canvas_wrapper_wrapper">
            <div className="canvas_wrapper">
                <canvas
                    className="canvas_style"
                    // We use the ref attribute to get direct access to the canvas element. 
                    ref={(ref) => { props.setCanvas(ref) }}
                    onMouseDown={props.onMouseDown}
                    onMouseLeave={props.onMouseUp}
                    onMouseUp={props.onMouseUp}
                    onMouseMove={props.onMouseMove}
                    onTouchStart={props.onTouchStart}
                    onTouchEnd={props.onTouchEnd}
                    onTouchMove={props.onTouchMove}
                >
                    Your browser does not support the HTML 5 Canvas.
                </canvas>
            </div>
        </div>
    );
}

export default BaseCanvas;