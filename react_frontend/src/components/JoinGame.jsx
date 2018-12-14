import React, {Component} from "react";
import autobind from 'autobind-decorator';
import PropTypes from 'prop-types';

@autobind
class JoinGame extends Component{

    constructor(props){
        super(props);
        
        this.state = {
            username: this.props.username,
            room: this.props.room,
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
        console.log("button was clicked : " + button);
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
                       onChange={this.handleChange} type="text" placeholder="Name"/>
                <div className="vspace10"/>
                <input name="room" className="input input_style" value={this.state.room} 
                    onChange={this.handleChange}  type="text" placeholder="Room Code"/>
                <hr className="hrstyle" />
                <a name="join_join" className="button is-outlined button_style" onClick={this.handleClick}>Join</a>
                <a name="join_back" className="button is-outlined button_style" onClick={this.handleClick}>Back</a>
            </React.Fragment>
        )
    }
}

JoinGame.propTypes = {
    changeLocation: PropTypes.func,
    changeUsername: PropTypes.func,
    username: PropTypes.string,
    room_code: PropTypes.string,
}

export default JoinGame;