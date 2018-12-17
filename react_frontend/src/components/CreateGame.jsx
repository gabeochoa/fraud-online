import React, {Component} from "react";
import autobind from 'autobind-decorator';
import PropTypes from 'prop-types';
import {makeid} from '../drawit/utils';

@autobind
class CreateGame extends Component{

    constructor(props){
        super(props);
        
        this.state = {
            name: this.props.username || "",
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
        // console.log("button was clicked ", button)
        switch(button){
            case "create_create":
                this.props.changeUsername(this.state.name, ()=>{});
                // must happen before location change ? 
                this.props.changeRoomCode(makeid(), ()=>{});
                this.props.changeLocation("lobby", ()=>{});
            break;
            case "create_back":
                this.props.changeUsername(this.state.name, ()=>{});
                this.props.changeLocation("_back", () => {
                    // console.log("Change location menu")
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
                <hr className="hrstyle" />
                <a name="create_create" className="button is-outlined button_style" 
                   onClick={this.handleClick}
                   style={button_stretch}
                   >Create</a>
                <a name="create_back" className="button is-outlined button_style" 
                   onClick={this.handleClick}
                   style={button_stretch}
                   >Back</a>
            </React.Fragment>
        )
    }
}


const button_stretch = {
    width: "40%", // 1/X where x is num of buttons
}

CreateGame.propTypes = {
    changeLocation: PropTypes.func,
}

export default CreateGame;