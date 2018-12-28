import React, { Component } from "react";
import autobind from 'autobind-decorator'
import About from '../components/About';

@autobind
class DrawitAbout extends Component{
    constructor(props){
        super(props)
    }
    
    handleClick(event){
        while(event.target.getAttribute("name") === null){
            event.target = event.target.parentNode;
        }
        let button = event.target.getAttribute("name");
        // console.log("button was clicked : " + button);
        switch(button){
            case "about_back":
                this.props.changeLocation("_back", () => {});
            break;
            default:
                console.log("button was clicked : " + button);
            break
        }
    }

    render_header(){
        return (
            <p></p>
        );
    }

    render_body(){
        return (
            <div style={{
                textAlign: "left"
            }}>
                <ul style={{
                    listStyleType: "disc"
                }}>
                    <li>Draw My Meme is based on the various pictionary drawing online games</li>

                    <li>The current artist will be assigned a word and they will draw it </li>
                    <li>The other players should try to guess what the word is</li>
                    <li>Each player gets one try to draw their word </li>
                    <li>Once everyone draws, the game ends. </li>
                </ul>
            </div>
        );
    }

    render_footer(){
        return (
            <h6 style={{
                fontSize: "0.75em"
            }}>If you enjoyed this game, please check out the other games on this site :) </h6>
        );
    }

    render(){
        return(
            <React.Fragment>
            <About
                header_text={this.render_header()}
                body={this.render_body()}
                footer_text={this.render_footer()}
            />
            <hr/>
            <a name="about_back" className="button is-outlined button_style button_font" 
                onClick={this.handleClick}
                style={button_stretch}
            >Back</a>
            </React.Fragment>
        );
    }
}

const button_stretch = {
    width: "40%", // 1/X where x is num of buttons
}

export default DrawitAbout