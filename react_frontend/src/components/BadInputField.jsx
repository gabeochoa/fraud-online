import React, {Component} from "react";
import autobind from "autobind-decorator";

@autobind
class BadInputField extends React.Component{
    constructor(props){
        super(props);

    }

    onChange(event){
        const response = this.props.onChange(event);
        // console.log("onchange_resp", response)
        const success = response[0];
        const err = response[1];
        this.props.set_bad_input(success, err);
    }

    render(){
        return (
            <input 
                name={this.props.name}
                className="input input_style" 
                value={this.props.minutes} 
                onChange={this.onChange} 
                type={this.props.type}
                placeholder={this.props.placeholder}
            />
        );
    }
}

export default BadInputField;