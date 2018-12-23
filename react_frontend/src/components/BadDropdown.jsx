import React, {Component} from "react";
import autobind from "autobind-decorator";
import Select from 'react-select';

@autobind
class BadDropdown extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        return (
            <Select 
                name={this.props.name}
                options={this.props.options} 
                onChange={this.props.onChange} 
                value={this.props.default_option} 
                placeholder={this.props.placeholder || "Select an option"}
            />
        );
    }
}

export default BadDropdown;