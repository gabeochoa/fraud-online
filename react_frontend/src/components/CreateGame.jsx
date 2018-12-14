import React, {Component} from "react";
import autobind from 'autobind-decorator';
import PropTypes from 'prop-types';
import makeid from '../drawit/utils';

@autobind
class CreateGame extends Component{

    constructor(props){
        super(props);
        
        this.state = {
            username: this.props.username,
            bad_input: false,
        }
    }

    handleChange(event) {
        var name = event.target.name;
        this.setState({
          [name]: event.target.value
        });
    }

    handleClick(event){
        while(event.target.getAttribute("name") === null){
            event.target = event.target.parentNode;
        }
        let button = event.target.getAttribute("name");
        switch(button){
            case "create_create":
                if(!this.state.bad_input){
                    // this.props.changeUsername(this.state.name, ()=>{});
                    // // must happen before location change ? 
                    // this.props.changeRoomCode(makeid(), ()=>{});
                    // this.props.changeLocation("waiting", ()=>{});
                }
            break;
            case "create_back":
                this.props.changeUsername(this.state.name, ()=>{});
                this.props.changeLocation("_back", () => {
                    console.log("Change location menu")
                });
            break;
            default:
                console.log("button was clicked : " + button);
            break
        }
    }

    render(){
        return (
            <React.Fragment>
                <input name="name" className="input input_style" value={this.state.name} 
                  onChange={this.handleChange} type="text" placeholder="Name"
                  />
            {this.state.bad_input? <p style={{color:"red"}}> Not a valid number</p>:<p>Enter a number in minutes</p>}
             <input name="minutes" className="input input_style" value={this.state.minutes} 
                  onChange={this.handleTimerChange} type="text" placeholder="5"
                  />
            <hr className="hrstyle" />
            <button className="button is-outlined button_style" type="submit" onClick={this.handleNewRoom} value="Join">Create</button>
            <a name="create_back" className="button is-outlined button_style" onClick={this.handleClick}>Back</a>
            </React.Fragment>
        )
    }
}

CreateGame.propTypes = {
    changeLocation: PropTypes.func,
}

export default CreateGame;