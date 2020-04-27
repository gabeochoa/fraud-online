// @flow

import React, { Component, useState, useEffect, useCallback, useContext } from 'react';
import windowSize from '../components/windowSize';
import '../components/menu.css';
import '../drawit/drawit.css';
import TooledTouchableCanvas from '../components/TooledTouchableCanvas';
import BottomBar from './BottomBar';
import FakeArtistDrawingText from './FakeArtistDrawingText';
import FakeArtistToastContainer from './FakeArtistToastContainer';
import FakeArtistLocationReference from './FakeArtistLocationReference';
import { clearAllBodyScrollLocks } from 'body-scroll-lock';
import BottomGameButtons from "../components/BottomGameButtons";
import autobind from "autobind-decorator";
import { parse } from 'acorn';
import { MenuContext } from '../components/Menu';
import ErrorBoundary from 'react-error-boundary';
import FakeArtistContext from './FakeArtistContext';

const FakeArtistCanvasMessageHandler = (props) => {
  const {
    register_socket_callbacks,
    unregister_socket_callbacks,
    extra_game_state,
    set_extra_game_state,
    set_game_option,
  } = useContext(MenuContext);

  const {
    end_round,
    isLoading,
    setIsLoading,
    setIsLocalPlayerArtist,
    setHideButtonState,
    showToast,
    setPlayer,
    updatePlayers,
    updateGameStarted,
  } = useContext(FakeArtistContext);

  const end_game = useCallback((msg, sender) => {
    console.log("please implement end game")
  }, []);

  const process_message = (parsedData) => {
    console.log("fake artist process message", parsedData)
    // dont care what message, just "done loading"
    if (isLoading) { setIsLoading(false); }
    const command = parsedData.command;
    if (command == 'voting') {
      setIsLocalPlayerArtist(false);
      setHideButtonState([false, true, true]);
      showToast('voting');
      return;
    }
    const sender = parsedData.sender;
    let players = parsedData.message.players;
    if (players) {
      players.forEach((item) => {
        if (item.channel == sender) {
          item.is_me = true;
          setPlayer(item);
        }
      });
      const is_game_started = parsedData.message.is_game_started;
      updatePlayers(players);
      updateGameStarted(is_game_started);
    }
    let locations = parsedData.message.locations;
    if (locations) {
      if (
        extra_game_state.locations &&
        extra_game_state.locations.length == 0
      ) {
        locations = [...parsedData.message.locations].map(
          (item) => { return [item, false]; }
        );
        set_extra_game_state('locations', locations);
      }
    }

    if (parsedData.message.num_rounds) {
      set_game_option('num_rounds', parsedData.message.num_rounds);
    }

    const end_round = (msg, sender) => {
      console.log("end round");
    }

    switch (command) {
      case 'get_room_response': //fall through
      case 'start_game': // fall through
      case 'end_round':
        end_round(parsedData.message, sender);
        break;
      case 'end_game':
        end_game();
        break;
    }
  }

  useEffect(() => {
    const socketCBName = 'FakeArtistCanvasMessageHandler';
    register_socket_callbacks(socketCBName, 'onmessage', process_message);
    return () => {
      unregister_socket_callbacks(socketCBName, 'onmessage');
    };
  }, []);
  return <div />;
}
export default FakeArtistCanvasMessageHandler;
