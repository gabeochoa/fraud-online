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

const disableSingleScrollLock = (element) => {
    if (element == null) { return; }
    element.style.position = 'static';
    element.style.overflow = 'scroll';
};

const disableGlobalScrollLock = () => {
    disableSingleScrollLock(document.body);
};

const enableSingleScrollLock = (element) => {
    if (element == null) { return; }
    element.style.position = 'fixed';
    element.style.overflow = 'hidden';
};

const enableGlobalScrollLock = () => {
    enableSingleScrollLock(document.body);
};

const FakeArtistTopMeta = ({
}) => {
    const {
        set_extra_game_state,
        extra_game_state,
    } = useContext(MenuContext);
    const {
        currentArtist,
    } = useContext(FakeArtistContext);
    const [showLocationModal, setShowLocationModal] = useState(false);

    const openLocationReference = () => {
        disableGlobalScrollLock();
        setShowLocationModal(true);
    };

    const closeLocationReference = () => {
        enableGlobalScrollLock();
        if (document.body == null) { return; }
        document.body.scrollTop = 0;
        setShowLocationModal(false);
    };

    const handleClickLocation = (event) => {
        while (event.target.getAttribute('name') === null) {
            event.target = event.target.parentNode;
        }
        const locations = [...extra_game_state.locations];
        const location = locations.filter(
            (c) => c[0] == event.target.getAttribute('name')
        )[0];
        const index = locations.indexOf(location);
        locations[index] = [location[0], !location[1]];
        set_extra_game_state('locations', locations);
    };

    return (
        <>
            <FakeArtistDrawingText
                currentArtist={currentArtist}
                openLocationReference={openLocationReference}
                closeLocationReference={closeLocationReference}
            />
            <FakeArtistLocationReference
                show_modal={showLocationModal}
                locations={extra_game_state.locations}
                onConfirm={closeLocationReference}
                handleClickLocation={handleClickLocation}
            />
        </>
    );
}

const FakeArtistCanvas2 = ({
    changeLocation,
    clearGameState,
    extra_game_state,
    game_options,
    register_socket_callbacks,
    reset_extra_game_state,
    send_message,
    set_default_game_state,
    set_extra_game_state,
    set_game_option,
    unregister_socket_callbacks,
    updateGameStarted,
    updatePlayers,
    kill_websocket,
}) => {
    const [currentArtist, setCurrentArtist] = useState(null);
    const [functions, setFunctions] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isLocalPlayerArtist, setIsLocalPlayerArtist] = useState(false);
    const [hideButtonState, setHideButtonState] = useState([true, true, true]);
    const [player, setPlayer] = useState(null);

    console.log("functions,", functions)

    const showToast = (toast: string) => {
        console.log('we should really show the toast: ', toast);
    };

    useEffect(() => {
        set_default_game_state('round', 1);
        set_default_game_state('locations', []);
        send_message({ command: 'start_game' });
        send_message({ command: 'get_room' });
        reset_extra_game_state();
        register_socket_callbacks(
            'drawingCanvas',
            'onmessage',
            process_message
        );
        return () => {
            clearAllBodyScrollLocks();
            unregister_socket_callbacks('drawingCanvas', 'onmessage');
        };
    }, []);

    const storeFunctions = (funcs) => {
        console.log('StoreFunctions: ', funcs);
        setFunctions(funcs);
    };

    const end_round = (data, sender) => {
        // console.log("end round", data, sender)
        // when a person is done drawing....
        // check if the new round is more than all rounds ever
        if (data.round >= game_options.rounds) {
            // done with rounds, lets vote
            send_message({ command: 'voting' });
            return;
        } else {
            // otherwise the new round needs to be set
            if (
                extra_game_state.round != data.round &&
                data.round < game_options.num_rounds
            ) {
                // TODO Fix toasts
                // set_extra_game_state("round", data.round, prop.notify_round());
                set_extra_game_state('round', data.round, () => { });
            }
        }
        // console.log("end_roundish", data.players, data.current_player)
        const player = data.players[data.current_player] || data.players[0];
        const is_local = player.channel == sender;
        if (is_local) {
            showToast('artist');
        }
        setCurrentArtist(player);
        setIsLocalPlayerArtist(is_local);
        setHideButtonState([is_local, true, true]);
    };

    const draw = useCallback(
        (msg) => {
            console.log("i want to draw what does my paint look like: ", functions)
            functions.upscale_paint(msg.prev, msg.cur, msg.tool);
        }, [functions]
    );

    const end_game = useCallback(() => {
        reset_extra_game_state();
        updateGameStarted(false);
        changeLocation('_back');
        functions.clear_canvas(false);
        setHideButtonState([false, false, false]);
    }, [functions]);

    const process_message = useCallback(
        (parsedData) => {
            // console.log("drawing canvas process message", parsedData)
            // dont care what message, just "done loading"
            if (isLoading) {
                setIsLoading(false);
            }
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
                // console.log(parsedData.message.locations)
                if (
                    extra_game_state.locations &&
                    extra_game_state.locations.length == 0
                ) {
                    locations = [...parsedData.message.locations].map(
                        (item) => {
                            return [item, false];
                        }
                    );
                    set_extra_game_state('locations', locations);
                }
            }

            if (parsedData.message.num_rounds) {
                set_game_option(
                    'num_rounds',
                    parsedData.message.num_rounds
                );
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
                case 'draw':
                    draw(parsedData.message);
                    break;
            }
        },
        [end_round, draw, end_game]
    );


    return (

        <>
            <FakeArtistTopMeta
                currentArtist={currentArtist}
                set_extra_game_state={set_extra_game_state}
                extra_game_state={extra_game_state}
            />
            <FakeArtistToastContainer />
            {/* <Timer total_time={this.state.total_time}/> */}
            <BottomBar
                current_artist={currentArtist}
                kill_websocket={kill_websocket}
                changeLocation={changeLocation}
                send_message={send_message}
                clearGameState={clearGameState}
                hideState={hideButtonState}
            />
            <TooledTouchableCanvas
                sendFunctions={storeFunctions}
                is_local_player_artist={isLocalPlayerArtist}
                send_message={send_message}
                hideClearButton={true}
            />
        </>
    );
};

const emptyFunction = () => { };
export const FakeArtistContext = React.createContext({
    currentArtist: null,
    setCurrentArtist: emptyFunction,
    hideButtonState: [true, true, true],
});
const FakeArtistProvider = FakeArtistContext.Provider;
const FakeArtistConsumer = FakeArtistContext.Consumer;

const FakeArtistCanvasMessageHandler = (props) => {
    const {
        register_socket_callbacks,
        unregister_socket_callbacks,
    } = useContext(MenuContext);

    useEffect(() => {
        const socketCBName = 'FakeArtistCanvasMessageHandler';
        register_socket_callbacks(socketCBName, 'onmessage', () => { });
        return () => {
            unregister_socket_callbacks(socketCBName, 'onmessage');
        };
    }, []);
    return (
        <></>
    );
}
const FakeArtistCanvas = (props) => {
    const [currentArtist, setCurrentArtist] = useState(null);
    const hideButtonState = [true, true, true];
    const {
        set_default_game_state,
        send_message,
        reset_extra_game_state,
    } = useContext(MenuContext);

    useEffect(() => {
        set_default_game_state('round', 1);
        set_default_game_state('locations', []);
        send_message({ command: 'start_game' });
        send_message({ command: 'get_room' });
        reset_extra_game_state();
        return () => { clearAllBodyScrollLocks(); };
    }, []);

    return (
        <FakeArtistProvider value={{
            currentArtist,
            setCurrentArtist,
            hideButtonState,
        }}>
            <ErrorBoundary>
                <FakeArtistCanvasMessageHandler />
                <FakeArtistTopMeta />
                <FakeArtistToastContainer />
                <BottomBar />
                <FakeArtistTouchableCanvas />
            </ErrorBoundary>
        </FakeArtistProvider>
    );
}

const FakeArtistTouchableCanvas = (props) => {
    // TODO 
    const is_local_player_artist = true;

    const {
        send_message,
        register_socket_callbacks,
        unregister_socket_callbacks,
    } = useContext(MenuContext);
    const [functions, setFunctions] = useState({})

    const process_message = (parsedData) => {
        const sender = parsedData.sender;
        switch (parsedData.command) {
            case "draw":
                const msg = parsedData.message;
                functions.upscale_paint(msg.prev, msg.cur, msg.tool);
                break;
        }
    }

    useEffect(() => {
        register_socket_callbacks("drawingCanvas", "onmessage", process_message);
        send_message({ command: "get_room" });
        return () => {
            clearAllBodyScrollLocks();
            unregister_socket_callbacks("drawingCanvas", "onmessage");
        }
    });

    return (
        <>
            <TooledTouchableCanvas
                hideClearButton={true}
                hideEraser={true}
                sendFunctions={setFunctions}
                is_local_player_artist={is_local_player_artist}
                send_message={send_message}
            />
        </>
    );
}

export default windowSize(FakeArtistCanvas);
