import React, {Component} from "react";
import autobind from 'autobind-decorator';
import PropTypes from 'prop-types';
import Icon from '@mdi/react'
import { mdiDelete, mdiPen } from '@mdi/js'

class SizeZeroIcon extends Component{
    render(){
        return (
            <div style={{fontSize:0}}>
                <Icon {...this.props}></Icon>
            </div>
        );
    }
}


@autobind
class Lobby extends Component{

    constructor(props){
        super(props);
    }

    handleClick(event){
        while(event.target.getAttribute("name") === null){
            event.target = event.target.parentNode;
        }
        let button = event.target.getAttribute("name");
        console.log("button was clicked : " + button);
        switch(button){
            case "lobby_start":
                // TODO need to start game too 
                this.props.changeLocation("game");
            break;
            case "lobby_leave":
                this.props.changeLocation("_back");
            break;
            default:
            console.log("default case");
            break
        }
    }

    render_person(person){
        let icon = <SizeZeroIcon name={icon_name} player={person.id} path={mdiDelete} size={1} />
        let icon_name = "kick_person"
        if(person.is_me){
            icon_name = "edit_name"
            icon = <SizeZeroIcon name={icon_name} path={mdiPen} size={1}/>
        }
        
        return (
            <li key={person.id} style={{display:"float",  marginBottom:5}}>
                <h1 style={{float: "left", paddingLeft:5, wordWrap: "break-word"}}>
                        {person.username} 
                </h1>
                <div style={{float: "right"}} name={icon_name} onClick={this.handleClick}> 
                    {icon}
                </div>
            </li>
        );
    }


    render(){
        let header = "Game is already in progress";
        if(!this.props.is_game_started){
            header = "Waiting for players....";
        }

        return (
            <React.Fragment>
            <h4 style={{fontSize: 30}}>{header}</h4>
            <h5>Room Code: {this.props.room_code}</h5>
            <hr className="hrstyle"/>
            <div>
                <ol className="olstyle">
                    {this.props.players.map((item) => this.render_person(item))}
                </ol>
            </div>
            <hr className="hrstyle"/>
            <div className="field is-centered button_bar_style">
                <a name="lobby_start" className="button is-outlined button_style"
                    onClick={this.handleClick}>Start Game</a>           
                <a name="lobby_leave" className="button is-outlined button_style" 
                    onClick={this.handleClick}>Leave Game</a>
            </div>
            </React.Fragment>
        )
    }
}

Lobby.propTypes = {
    changeLocation: PropTypes.func,
    rws: PropTypes.any, // needs to be socket item
    room_code: PropTypes.string,
}

export default Lobby;