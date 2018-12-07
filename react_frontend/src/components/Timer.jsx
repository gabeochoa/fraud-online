import React, { Component } from "react";
import "../spyfall/spyfall.css";

class Timer extends Component{

    constructor(props){
        super(props);
    }
    render(){
        if(this.props.minutes == 0 && parseInt(this.props.seconds) < 30){
            return (
                <div style={{textAlign:"center"}} className="blinking">
                    <h1>{this.props.minutes}:{this.props.seconds}</h1>
                </div>
            );
        }
        return (
            <div style={{textAlign:"center"}}>
                <h1>{this.props.minutes}:{this.props.seconds}</h1>
            </div>
        );
    }
}

export default Timer;
