import React, { Component } from "react";
import Icon from '@mdi/react'
import { mdiHatFedora } from '@mdi/js'
import "./spyfall.css"
import autobind from "autobind-decorator";

@autobind
class MenuButtonBar extends Component {
  constructor(props) {
    super(props);

    this.state = { 
        location: this.props.start_location,
        name: this.props.username,
        room: this.props.room,
        bad_input: false, 
      };

    this.next_loc = {
      "home_create": "create",
      "home_join": "join",
      "join_back": "home",
      "create_back": "home"
    }
  }

  handleChange(event) {
    var name = event.target.name;
    this.setState({
      [name]: event.target.value
    });
  }

  handleTimerChange(event){
    if(event.target === undefined){
      console.log(event)
      return 
    }
    var validRE = /^\d{1,100}$/;
    if(event.target.value.match(validRE) == null){
      this.setState({
        bad_input: true
      })
    }
    else{
      this.setState({
        bad_input: false,
      })
      this.props.changeTimer(parseInt(event.target.value))
    }
  }

  makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length)).toLocaleLowerCase();
    return text;
  }

  handleNewRoom(event){
    if(!this.state.bad_input){
      this.props.changeUsername(this.state.name, ()=>{});
      this.props.changeLocation(this.makeid(), "waiting", ()=>{});
    }
  }
  // external 
  handleSubmit(event){
    // tell my mom my name and location changed
    this.props.changeUsername(this.state.name, ()=>{});
    this.props.changeLocation(this.state.room, "waiting", () => {
      console.log("Change location menu")
    });
  }

  // for internal to the menu
  handleClick(event) {
    console.log("button was clicked : " + event.target.name);
    let next_target = this.next_loc[event.target.name];

    this.setState({
      location: next_target
    });
  }

  renderHome(){
    return (
      <React.Fragment>
          <a name="home_create" className="button is-outlined button_style"
             onClick={this.handleClick}>New Game</a>           
          <a name="home_join" className="button is-outlined button_style" 
             onClick={this.handleClick}>Join Game</a>
        </React.Fragment>
    );
  }

  renderCreate(){
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
    );
  }

  renderJoin(){
    return (
      <React.Fragment>
            <input name="name" className="input input_style" value={this.state.name} 
                   onChange={this.handleChange} type="text" placeholder="Name"/>
            <div className="vspace10"/>
            <input name="room" className="input input_style" value={this.state.room} 
                   onChange={this.handleChange}  type="text" placeholder="Room Code"/>
            <hr className="hrstyle" />
            <button className="button is-outlined button_style" onClick={this.handleSubmit} value="Join">Join</button>
            <a name="join_back" className="button is-outlined button_style" onClick={this.handleClick}>Back</a>
      </React.Fragment>
    );
  }

  render() {
    let content = <p>Loading</p>;

    switch (this.state.location) {
      case "home":
        content = this.renderHome()
        break;
      case "join":
        content = this.renderJoin()
        break;
      case "create":
        content = this.renderCreate()
        break;
      default:
        content = this.renderHome()
        break;
    }
    return (
      <div id="button_bar" className="field is-centered button_bar_style">
          <h4 style={{fontSize: 30}}> <Icon path={mdiHatFedora} size={1.5}/> Spyfall</h4>
          <hr className="hrstyle" />
        {content}
      </div>
    );
  }

}

export default MenuButtonBar;