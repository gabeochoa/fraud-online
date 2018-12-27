import React, { Component } from "react";
import "../spyfall/spyfall.css";
import autobind from "autobind-decorator";

function TimerDisplay(props){
    if(props.minutes == 0 && parseInt(props.seconds) < 30){
        return (
            <div style={{textAlign:"center"}} className="blinking">
                <h1>{props.minutes}:{props.seconds}</h1>
            </div>
        );
    }
    return (
        <div style={{textAlign:"center"}}>
            <h1>{props.minutes}:{props.seconds}</h1>
        </div>
    );
}

@autobind
class Timer extends Component{
    constructor(props){
        super(props)

        this.secondsRemaining = this.props.total_time;
        let minutes = Math.floor(this.secondsRemaining / 60);
        let seconds = this.secondsRemaining - minutes * 60;
        this.state = {
            value: minutes.toString().padStart(2, '0'),
            seconds: seconds.toString().padStart(2, '0'),
        }
        this.intervalHandle;
    }


    componentDidMount(){
        this.startCountDown();
    }

    componentWillUnmount(){
        clearInterval(this.intervalHandle);
    }

    tick() {
        let minutes = Math.floor(this.secondsRemaining / 60);
        let seconds = this.secondsRemaining - minutes * 60;

        this.setState({
            seconds: seconds.toString().padStart(2, '0'),
            value: minutes.toString().padStart(2, '0'),
        });

        if (minutes === 0 & seconds === 0) {
            clearInterval(this.intervalHandle);
        }
        this.secondsRemaining--
    }

    startCountDown() {
        this.intervalHandle = setInterval(this.tick, 1000);
        this.secondsRemaining = this.props.total_time;
        this.setState({
            isClicked : true
        })
    }

    render(){
        return (
            <TimerDisplay minutes={this.state.value} seconds={this.state.seconds} />
        );
    }

}

export default Timer;
