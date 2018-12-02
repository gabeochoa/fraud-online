import React, { Component } from "react";
import ReactDOM from "react-dom";
import Container from "../components/Container";
import MenuButtonBar from "./menu";
import SpyfallWaitingRoom from "./room";
import SpyfallGame from "./playing";

class BaseApplication extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <Container>
        {/* <MenuButtonBar></MenuButtonBar> */}
        {/* <SpyfallWaitingRoom access_code={"2JF39NCL2"}/> */}
        <SpyfallGame></SpyfallGame>
      </Container>
    )
  }
}

const SpyfallApp = () => (
  <BaseApplication />
);

const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<SpyfallApp />, wrapper) : null;