import React, { Component } from "react";
import PropTypes from "prop-types";
import key from "weak-key";


const divStyle = {
    margin: '40px',
    border: '5px solid white'
  };

class Container extends Component{
    constructor(props){
        super(props);
    }
    render(){
        return (
        <div style={divStyle}>
            {this.props.children}
        </div>
        );
    }
}
export default Container;