import React, { Component } from "react";
import ReactDOM from 'react-dom';
import Canvas from './canvas';

class DrawIt extends Component {


  render(){
    return (
      <Canvas></Canvas>
    );
  }
}


const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<DrawIt />, wrapper) : null;