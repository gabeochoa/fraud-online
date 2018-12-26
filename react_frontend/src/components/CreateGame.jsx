import React, {Component} from "react";
import autobind from 'autobind-decorator';
import PropTypes from 'prop-types';
import {makeid} from '../drawit/utils';
import "./menu.css";

@autobind
class CreateGame extends Component{

    constructor(props){
        super(props);
        
        this.state = {
            name: this.props.username || "",
            bad_input: false,
            err_msg: null, 
        }
    }

    set_bad_input(state, err_msg){
        this.setState({
            bad_input: state,
            err_msg: err_msg
        })
    }

    handleChange(event) {
        var name = event.target.name;
        this.setState({
          [name]: event.target.value
        });
        // Example of what to do to stop creation on error
        // if(name == "name" && event.target.value == ""){
        //     this.setState({
        //         bad_input: true,
        //         err_msg: "Username cannot be blank"
        //     })
        // }
    }

    handleClick(event){
        while(event.target.getAttribute("name") === null){
            event.target = event.target.parentNode;
        }
        let button = event.target.getAttribute("name");
        // console.log("button was clicked ", button)
        switch(button){
            case "create_create":
                if( !this.state.bad_input){
                    this.props.changeUsername(this.state.name, ()=>{});
                    // must happen before location change ? 
                    this.props.changeRoomCode(makeid(), ()=>{});
                    this.props.changeLocation("lobby", ()=>{});
                }
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

    render_children(){
        let props_for_children = {... this.props}
        // certain elements cant have children;
        // we also shouldnt give all children to our children
        delete props_for_children['children']  
        const children = React.Children.map(this.props.children, (child, index) => {
            const child_props = {
                ...props_for_children,
                set_bad_input: this.set_bad_input,
            }
            if (child.props.inherit_create_game_props){
                return React.cloneElement(child, child_props);}
            else{return React.cloneElement(child, {});}
        });
        return children;
    }

    render(){
        return (
            <React.Fragment>
                <div className="div_set">
                    <input 
                        name="name" 
                        className="input input_style" 
                        value={this.state.name} 
                        onChange={this.handleChange} 
                        type="text" placeholder="Name"
                    />
                    {this.state.bad_input? 
                        <p style={{color:"red"}}> {this.state.err_msg}</p>
                        :
                        <p></p>
                    }
                    {this.render_children()}
                    <hr className="hrstyle" />
                    <a 
                        name="create_create" 
                        className="button is-outlined button_style button_font" 
                        onClick={this.handleClick}
                        style={button_stretch}
                        >
                            Create
                    </a>
                    <a 
                        name="create_back" 
                        className="button is-outlined button_style button_font" 
                        onClick={this.handleClick}
                        style={button_stretch}
                        >
                            Back
                    </a>
                </div>
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