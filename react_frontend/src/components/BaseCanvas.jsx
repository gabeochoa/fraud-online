import React, { Component } from "react";
import "../components/menu.css";
import "../drawit/drawit.css";

class BaseCanvas extends Component{ 
    constructor(props){
        super(props);
    }

    render(){
        return (
            <div className="canvas_wrapper_wrapper">
                <div className="canvas_wrapper">
                    <canvas
                        className="canvas_style"
                        // We use the ref attribute to get direct access to the canvas element. 
                        ref={(ref) => {
                            this.props.setCanvas(ref)
                        }}
                        onMouseDown={this.props.onMouseDown}
                        onMouseLeave={this.props.onMouseUp}
                        onMouseUp={this.props.onMouseUp}
                        onMouseMove={this.props.onMouseMove}
                        onTouchStart={this.props.onTouchStart}
                        onTouchEnd={this.props.onTouchEnd}
                        onTouchMove={this.props.onTouchMove}
                    > Your browser does not support the HTML 5 Canvas.  
                    </canvas>
                </div>
            </div>
        );
    }
}

export default BaseCanvas;