import React, { Component } from "react";
import autobind from "autobind-decorator";
import About from "../components/About";

const FakeArtistAbout = (props) => {
  const handleClick = (event) => {
    while (event.target.getAttribute("name") === null) {
      event.target = event.target.parentNode;
    }
    let button = event.target.getAttribute("name");
    // console.log("button was clicked : " + button);
    switch (button) {
      case "about_back":
        props.changeLocation("_back", () => { });
        break;
      default:
        console.log("button was clicked : " + button);
        break;
    }
  }

  return (
    <>
      <About
        header_text={<p></p>}
        body={
          <div style={{ textAlign: "left", }} >
            <ul style={{ listStyleType: "cjk-ideographic", }} >
              <li>Fake Artist is based on the japanese board game:</li>
              <a href="https://oinkgms.com/en/a-fake-artist-goes-to-new-york">
                A Fake Artist Goes To New York
              </a>
              <li>
                Whoever draws first will keep in mind some object or person or thing
                that reminds them of the location.
              </li>
              <li>Players take turns adding one line per round to the drawing.</li>
              <li>
                However there is one spy amongst the players who is trying to figure
                out the location.
              </li>
              <li>
                After all the rounds are over, all players vote on who they think is
                the spy.
              </li>
              <li>If the real spy gets the most votes they lose. </li>
              <li> However if the spy guesses correctly what the place was, then they win. </li>
            </ul>
          </div>
        }
        footer_text={
          <h6 style={{ fontSize: "0.75em", }} >
            If you enjoyed this game, please check out the physical version linked
            above :)
          </h6>
        }
      />
      <hr />
      <a
        name="about_back"
        className="button is-outlined button_style button_font"
        onClick={handleClick}
        style={button_stretch}
      >
        Back
        </a>
    </>
  );
}

const button_stretch = {
  width: "40%", // 1/X where x is num of buttons
};

export default FakeArtistAbout;
