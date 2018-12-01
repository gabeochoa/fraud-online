import React, { Component } from "react";
import ReactDOM from "react-dom";
import Container from "../components/Container";
import MenuButtonBar from "./menu";

class SpyfallContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <Container>
        <MenuButtonBar></MenuButtonBar>
      </Container>
    )
  }
}

export default SpyfallContainer;