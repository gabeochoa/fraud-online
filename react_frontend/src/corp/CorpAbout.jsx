import React, { Component } from "react";
import autobind from 'autobind-decorator'
import About from '../components/About';

import './corp.css'

@autobind
class CorpAbout extends Component{
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
                    listStyleType: "cjk-ideographic"
                }}>
                    <li>Corporate Takeover is a card game inspired by coup but without any bluffing</li>
                    
                    <li>At the start of each round players are given up to two employee cards </li>

                    <li>Players take turns either using generic abilities or their employees abilities.</li>
                    <li>Every turn, players get two action points to spend on their abilities</li>
                    <li>If a player uses an employee's ability, that employee gets put back in the deck</li>
                    <li>No player can have more than two employees at a time, except in the hiring phase</li>

                    {/* <li> After every player makes their turn for the round, the first player from that round can take any remaining actions they have</li> */}
                </ul>
                <p> There are 7 different employee types and 3 of each in the deck. 
                    Every turn, you can choose to evoke an employees ability 
                    (which causes them to quit your company) or to take one of the generic actions. </p>
                <h2>The roles are: </h2>
                <div className="empdesc">
                <img src="https://fakeimg.pl/64x64/"/>
                    <p>
                        <b>Tax Accountant</b>.
                        They can play around with your taxes and collect $2 million from the bank.
                    </p>
                </div>
                <br/>
                <div className="empdesc">
                <img src="https://fakeimg.pl/64x64/"/> 
                    <p>
                    <b>HR Employee</b>.
                    They can fire all your employees and replace them with new ones. 
                    (Draw two employee cards and choose which of the 3 to keep without keeping the HR card)
                    </p>
                </div>
                <br/>
                <div className="empdesc">
                <img src="https://fakeimg.pl/64x64/"/> 
                    <p>
                    <b>The Con-Man</b>: They can steal up to $2 million from any other player, but can be blocked by Police or Govt
                    </p>
                </div>
                <br/>
                <div className="empdesc">
                <img src="https://fakeimg.pl/64x64/"/> 
                    <p>
                    <b>The Insider Trader</b>: They can steal $3 million from the bank, but can be blocked by the govt.
                    </p>
                </div>
                <br/>
                <div className="empdesc">
                <img src="https://fakeimg.pl/64x64/"/> 
                    <p>
                    <b>Police Officer</b>
                    They can block the con-man from stealing. 
                    A company can also bribe the an employee police officer with $3 million to arrest another player's employee.
                    <sup>1</sup>
                    </p>
                </div>
                <br/>
                <div className="empdesc">
                <img src="https://fakeimg.pl/64x64/"/>
                    <p>
                     <b>Government Employee (SEC)</b>.
                    They can block any illegal actions made by other players. 
                    </p>

                </div>
            </div>
        );
    }

    render_footer(){
        return (
            <>
                
                <br/>
                <sup>1: During an arrest or frame, the player being arrested/framed can choose which of the two cards to give up.
                     However if the player only has one employee left, then they are out of the game and their cards return to the discard pile.</sup>
            </>
        );
        return (
            <>
            <table>
                <thead>
                <tr>
                    <th>Employee Needed</th>
                    <th>Outcome</th>
                    <th>Cost</th>
                </tr>
                </thead>
                <tbody>
                {data.map((item, i) => {
                    return (
                        <tr key={i}>
                        <td>{item[0]}</td>
                        <td>{item[1]}</td>
                        <td>{item[2]}</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
            <h6 style={{
                fontSize: "0.75em"
            }}>If you enjoyed this game, please check out the physical version linked above :) </h6>
            </>
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

export default CorpAbout