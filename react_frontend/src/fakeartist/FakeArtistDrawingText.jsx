import React from "react";
import "../components/menu.css";
import "../drawit/drawit.css";
import { Button } from "@material-ui/core";
import { mdiMapMarker } from "@mdi/js";
import Icon from "@mdi/react";

const pretty_location = (location) => {
  return location == null || location == undefined || location == ""
    ? location
    : location
      .split("_")
      .map((item) => {
        return item.charAt(0).toUpperCase() + item.slice(1);
      })
      .join(" ");
};

const _FakeText = ({ text, onClick }) => {
  return (
    <div
      style={{
        position: "inherit",
        display: "-webkit-inline-box",
        left: 40,
        margin: 3,
      }}
    >
      <h1 style={{ color: "#4a4a4a" }}> {pretty_location(text)} </h1>
      <Button
        name="mapmarker"
        onClick={onClick}
        style={{
          top: "-0.75em",
          margin: 0,
          padding: 0,
        }}
      >
        <Icon path={mdiMapMarker} size={"1em"} />
      </Button>
    </div>
  );
};

const FakeArtistDrawingText = ({
  currentArtist,
  openLocationReference,
  closeLocationReference,
}) => {
  const onClickHandler = (event) => {
    while (event.target.getAttribute("name") === null) {
      event.target = event.target.parentNode;
    }
    const button_ = event.target.getAttribute("name");
    switch (button_) {
      case "mapmarker":
        openLocationReference();
        break;
      case "toolbox":
        closeLocationReference();
        break;
      default:
        break;
    }
  };

  if (currentArtist == null) {
    return <_FakeText text={"Loading..."} onClick={onClickHandler} />;
  }
  if (currentArtist.is_me) {
    // im drawing; either i know the location or im the spy
    return currentArtist.is_spy ? (
      <_FakeText text={"You are the spy :)"} onClick={onClickHandler} />
    ) : (
        <_FakeText
          text={"The location is: " + currentArtist.location}
          onClick={onClickHandler}
        />
      );
  } else {
    // im not drawing, so lets just say someone else is
    return currentArtist.is_spy ? (
      <_FakeText
        text={currentArtist.username + " is drawing"}
        onClick={onClickHandler}
      />
    ) : (
        <_FakeText
          text={currentArtist.username + " is drawing a " + player.location}
          onClick={onClickHandler}
        />
      );
  }
};

export default FakeArtistDrawingText;
