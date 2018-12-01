import React, { Component } from "react";
import ReactDOM from "react-dom";
import Container from "../components/Container";
import MenuButtonBar from "./menu";

class BaseApplication extends Component {
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

const SpyfallApp = () => (
  <BaseApplication />
);

const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<SpyfallApp />, wrapper) : null;