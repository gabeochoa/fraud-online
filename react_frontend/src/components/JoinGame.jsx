import React, {Component} from "react";
import autobind from 'autobind-decorator';
import PropTypes from 'prop-types';

@autobind
class JoinGame extends Component{

    constructor(props){
        super(props);
        
        this.state = {
            name: this.props.username || "",
            room_code: this.props.room_code || "",
        }
    }

    handleChange(event) {
        // console.log("handle change", event, event.target.name, event.target.value);
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
        // console.log("button was clicked : " + button);
        switch(button){
            case "join_join":
                this.props.changeUsername(this.state.name, ()=>{});
                // must happen before location change ? 
                this.props.changeRoomCode(this.state.room_code, ()=>{});
                this.props.changeLocation("lobby", ()=>{});
            break;
            case "join_back":
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
                       onChange={this.handleChange} type="text" placeholder="Name"/>
                <div className="vspace10"/>
                <input name="room_code" className="input input_style" value={this.state.room_code} 
                    onChange={this.handleChange}  type="text" placeholder="Room Code"/>
                <hr className="hrstyle" />
                <a name="join_join" className="button is-outlined button_style" 
                   onClick={this.handleClick}
                   style={button_stretch}
                   >Join</a>
                <a name="join_back" className="button is-outlined button_style" 
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


JoinGame.propTypes = {
    changeLocation: PropTypes.func,
    changeUsername: PropTypes.func,
    username: PropTypes.string,
    room_code: PropTypes.string,
}

export default JoinGame;