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
import { any } from 'prop-types';

const emptyFunction = () => { };
const oneParamFunction = (a) => { };
const FakeArtistContextParamsType = any;

const FakeArtistContext: FakeArtistContextParamsType = React.createContext({
  currentArtist: null,
  setCurrentArtist: emptyFunction,
  hideButtonState: [true, true, true],
  isLoading: false,
  setIsLoading: oneParamFunction,
  setIsLocalPlayerArtist: oneParamFunction,
  setHideButtonState: oneParamFunction,
  showToast: oneParamFunction,
  setPlayer: oneParamFunction,
  updatePlayers: oneParamFunction,
  updateGameStarted: oneParamFunction,
});

export default FakeArtistContext;