import React, {Component} from "react";
import autobind from 'autobind-decorator';
import PropTypes from 'prop-types';

@autobind
class Home extends Component{

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
            case "home_create":
                this.props.changeLocation("create");
            break;
            case "home_join":
                this.props.changeLocation("join");
            break;
            default:
                console.log("default case");
            break
        }
    }

    render(){
        return (
            <React.Fragment>
                <a name="home_create" className="button is-outlined button_style"
                   style={{width:"40%"}}
                   onClick={this.handleClick}>
                   New Game
                </a>           
                <a name="home_join" className="button is-outlined button_style" 
                   style={{width:"40%"}}
                   onClick={this.handleClick}>
                   Join Game
                </a>
            </React.Fragment>
        )
    }
}

Home.propTypes = {
    changeLocation: PropTypes.func,
}

export default Home;