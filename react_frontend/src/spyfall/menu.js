import React, { Component } from "react";
import ReactDOM from "react-dom";
import Container from "../components/Container";
import Icon from '@mdi/react'
import { mdiEye, mdiHatFedora } from '@mdi/js'
import "./spyfall.css"

class MenuButtonBar extends Component {
  constructor(props) {
    super(props);

    this.state = { 
        location: "home",
        name: "",
        room: "" 
      };

    this.next_loc = {
      "home_create": "create",
      "home_join": "join",
      "join_back": "home",
      "create_back": "home"
    }

    // This binding is necessary to make `this` work in the callback
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    name = event.target.name;
    this.setState({
      [name]: event.target.value
    });
  }

  handleSubmit(event){
    // when the person hits submit
    // we just send them to that room
    // with the name they chose
    console.log(this.state.name + " " + this.state.room)
    event.preventDefault();
  }

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
          <form onSubmit={this.handleSubmit}>
            <input name="name" className="input input_style" value={this.state.name} 
                   onChange={this.handleChange} type="text" placeholder="Name"/>
            <hr className="hrstyle" />
            <button className="button is-outlined button_style" type="submit" value="Join">Create</button>
            <a name="create_back" className="button is-outlined button_style" onClick={this.handleClick}>Back</a>
          </form>
      </React.Fragment>
    );
  }

  renderJoin(){
    return (
      <React.Fragment>
          <form onSubmit={this.handleSubmit}>
            <input name="name" className="input input_style" value={this.state.name} 
                   onChange={this.handleChange} type="text" placeholder="Name"/>
            <div className="divider"/>
            <input name="room" className="input input_style" value={this.state.room_code} 
                   onChange={this.handleChange}  type="text" placeholder="Room Code"/>
            <hr className="hrstyle" />
            <button className="button is-outlined button_style" type="submit" value="Join">Join</button>
            
            <a name="join_back" className="button is-outlined button_style" onClick={this.handleClick}>Back</a>
          </form>
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