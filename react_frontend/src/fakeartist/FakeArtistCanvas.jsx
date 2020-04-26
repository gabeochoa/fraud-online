import React, { Component, useState, useEffect } from "react";
import windowSize from '../components/windowSize';
import { enableBodyScroll, disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import autobind from 'autobind-decorator'
import "../components/menu.css";
import "../drawit/drawit.css";
import TooledTouchableCanvas from "../components/TooledTouchableCanvas";
import BottomBar from './BottomBar';
import { Button } from "@material-ui/core";
import { mdiMapMarker, mdiToolbox, mdiBorderAll } from "@mdi/js";
import Icon from '@mdi/react'
import SweetAlert from "react-bootstrap-sweetalert/lib/dist/SweetAlert";
import 'react-toastify/dist/ReactToastify.min.css';
import { ToastContainer, toast } from 'react-toastify';

const column_list = {
    columnCount: 2,
    columnGap: "3px",
    columnRuleColor: "white",
    columnRuleStyle: "solid",
    columnRuleWidth: "10px",
}
const column_list_item = {
    padding: "0 0 0 10px",
    margin: "0 0 4px 0",
    backgroundColor: "#f0f0f0",
    columnSpan: "1",
    wordWrap: "break-word",
}

const pretty_location = (location) => {
    return (
        location == null || location == undefined || location == ""
            ? location :
            (
                location
                    .split("_")
                    .map((item) => { return item.charAt(0).toUpperCase() + item.slice(1); })
                    .join(" ")
            )
    );
}

const LocationReference = (props) => {
    const renderPlace = (place) => {
        const place_text = place[1]
            ? <p style={{ color: "#bbb", textDecoration: "line-through" }}> {pretty_location(place[0])} </p>
            : <p> {pretty_location(place[0])} </p>;
        return (
            <li key={place[0]} name={place[0]} onClick={props.handleClickLocation} style={column_list_item}>
                {place_text}
            </li>
        );
    }
    return (
        !props.show_modal ? null :
            (
                <SweetAlert
                    title={"Locations"}
                    style={{
                        // top: "-1em",
                        position: "absolute",
                        overflowY: "scroll",
                        top: "45%",
                        touchAction: "auto",
                        pointerEvents: "auto",
                    }}
                    confirmBtnText={"close locations"}
                    onConfirm={props.onConfirm}
                    onCancel={props.onConfirm}

                >
                    <ul style={column_list}>
                        {props.locations.map((place) => renderPlace(place))}
                    </ul>
                </SweetAlert>
            )
    );
}

const FakeArtistCanvas = (props) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isLobby, setIsLobby] = useState(false);
    const [currentArtist, setCurrentArtist] = useState(null);
    const [isLocalPlayerArtist, setIsLocalPlayerArtist] = useState(false);
    const [hideButtonState, setHideButtonState] = useState([true, true, true]);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [player, setPlayer] = useState(null);
    const showing_toast = { artist: false, round: false, voting: false, }
    const [functions, setFunctions] = useState({});

    const storeFunctions = (funcs) => {
        setFunctions(funcs)
    }

    const touchable_canvas = React.createRef();

    props.set_default_game_state("round", 1)
    props.set_default_game_state("locations", [])

    const notify_voting = (props) => {
        toast("Time for Voting!", {
            position: 'top-center',
            onClose: () => showing_toast['voting'] = false,
        });
    };

    const _actual_round_toast = () => {
        let cur_round = props.extra_game_state.round || 0
        toast.info("Round " + (cur_round + 1) + " of "
            + props.game_options.num_rounds + "!", {
            onClose: () => showing_toast['round'] = false,
            position: "top-center",
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
        });
    };

    const notify_round = () => {
        props.set_extra_game_state("round",
            props.extra_game_state.round + 1,
            () => { _actual_round_toast() }
        )
    }

    const notify_artist = () => {
        toast.info("Time for Drawing; One stroke only please!", {
            position: toast.POSITION.BOTTOM_CENTER,
            onOpen: () => showing_toast['artist'] = true,
            onClose: () => showing_toast['artist'] = false,
        });
    }

    useEffect(() => {
        props.register_socket_callbacks("drawingCanvas", "onmessage", process_message)
        props.send_message({ command: 'start_game' });
        props.send_message({ command: 'get_room' });
        props.reset_extra_game_state()
        return () => {
            clearAllBodyScrollLocks();
            props.unregister_socket_callbacks("drawingCanvas", "onmessage")
        }
    });

    const end_round = (data, sender) => {
        console.log("end round", data, sender)
        // when a person is done drawing....
        // check if the new round is more than all rounds ever 
        if (data.round >= (props.game_options.rounds)) {
            // done with rounds, lets vote
            props.send_message({ command: "voting" })
            return;
        }
        else {
            // otherwise the new round needs to be set
            if (props.extra_game_state.round != data.round
                && data.round < props.game_options.num_rounds) {
                props.set_extra_game_state("round", data.round, notify_round());
            }
        }
        // console.log("end_roundish", data.players, data.current_player)
        const player = data.players[data.current_player] || data.players[0];
        const is_local = (player.channel == sender);
        if (is_local && !showing_toast['artist']) {
            notify_artist()
            showing_toast['artist'] = true
        }
        setCurrentArtist(player);
        setIsLocalPlayerArtist(is_local);
        setHideButtonState([is_local, true, true])
    }

    const process_message = (parsedData) => {
        // console.log("drawing canvas process message", parsedData)
        // dont care what message, just "done loading"
        if (isLoading) { setIsLoading(false) }
        const command = parsedData.command;
        if (command == "voting") {
            setIsLocalPlayerArtist(false)
            setHideButtonState([ false, true, true, ])
            showing_toast['artist'] = true
            if (!showing_toast['voting']) {
                notify_voting();
                showing_toast['voting'] = true
            }
            return
        }

        const sender = parsedData.sender;
        let players = parsedData.message.players;
        if (players) {
            players.forEach(
                (item) => {
                    if (item.channel == sender) {
                        item.is_me = true;
                        setPlayer(item);
                    }
                }
            );
            const is_game_started = parsedData.message.is_game_started;
            props.updatePlayers(players);
            props.updateGameStarted(is_game_started);
        }

        let locations = parsedData.message.locations
        if (locations) {
            // console.log(parsedData.message.locations)
            if (props.extra_game_state.locations &&
                props.extra_game_state.locations.length == 0) {
                locations = [...parsedData.message.locations].map((item) => { return [item, false] })
                props.set_extra_game_state("locations", locations);
            }
        }

        if (parsedData.message.num_rounds) {
            props.set_game_option("num_rounds", parsedData.message.num_rounds)
        }

        switch (command) {
            case "get_room_response": //fall through
            case "start_game": // fall through
            case "end_round":
                end_round(parsedData.message, sender)
                break;
            case "end_game":
                props.reset_extra_game_state()
                props.updateGameStarted(false);
                props.changeLocation("_back");
                touchable_canvas.clear_canvas(false);
                setHideButtonState([false, false, false])
                break
            case "draw":
                const msg = parsedData.message;
                touchable_canvas.upscale_paint(msg.prev, msg.cur, msg.tool)
                break
        }
    }

    const onClickHandler = (event) => {
        if (event.target == canvas) { event.preventDefault(); }
        while (event.target.getAttribute("name") === null) {
            event.target = event.target.parentNode;
        }
        const button_ = event.target.getAttribute("name");
        switch (button_) {
            case "mapmarker": openLocationReference(); break;
            case "toolbox": closeLocationReference(); break;
            default: break;
        }
    }

    const disableSingleScrollLock = (element) => {
        element.style.position = "static";
        element.style.overflow = "scroll";
    }

    const disableGlobalScrollLock = () => {
        disableSingleScrollLock(document.body)
    }

    const enableSingleScrollLock = (element) => {
        element.style.position = "fixed";
        element.style.overflow = "hidden";
    }

    const enableGlobalScrollLock = () => {
        enableSingleScrollLock(document.body)
    }

    const openLocationReference = () => {
        disableGlobalScrollLock();
        setShowLocationModal(true)
    }

    const closeLocationReference = () => {
        enableGlobalScrollLock();
        document.body.scrollTop = 0;
        setShowLocationModal(false)
    }

    const handleClickLocation = (event) => {
        while (event.target.getAttribute("name") === null) {
            event.target = event.target.parentNode;
        }
        const locations = [...props.extra_game_state.locations]
        const location = locations.filter(c => c[0] == event.target.getAttribute("name"))[0];
        const index = locations.indexOf(location);
        locations[index] = [location[0], !location[1]];
        props.set_extra_game_state("locations", locations);
    }

    const render_text = (text) => {
        return (
            <div style={{ position: "inherit", display: "-webkit-inline-box", left: 40, margin: 3 }}>
                <h1 style={{ color: '#4a4a4a' }}> {pretty_location(text)} </h1>
                <Button
                    name="mapmarker"
                    onClick={onClickHandler}
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
    }

    const render_artist_ui = () => {
        if (currentArtist == null) { return render_text("Loading..."); }
        if (currentArtist.is_me) {
            // im drawing; either i know the location or im the spy
            return (
                currentArtist.is_spy
                    ? render_text("You are the spy :)")
                    : render_text("The location is: " + currentArtist.location)
            );
        }
        else {
            // im not drawing, so lets just say someone else is 
            return (
                currentArtist.is_spy
                    ? render_text(currentArtist.username + " is drawing a " + player.location)
                    : render_text(currentArtist.username + " is drawing")
            );
        }
    }

    return (
        <>
            <ToastContainer />
            {/* <Timer total_time={this.state.total_time}/> */}
            <LocationReference
                show_modal={showLocationModal}
                locations={props.extra_game_state.locations}
                onConfirm={closeLocationReference}
                handleClickLocation={handleClickLocation}
            />
            {render_artist_ui()}
            <BottomBar
                current_artist={currentArtist}
                kill_websocket={props.kill_websocket}
                changeLocation={props.changeLocation}
                send_message={props.send_message}
                clearGameState={props.clearGameState}
                hideState={hideButtonState}
            />
            <TooledTouchableCanvas
                sendFunctions={storeFunctions}
                is_local_player_artist={isLocalPlayerArtist}
                send_message={props.send_message}
                hideClearButton={true}
            />
        </>
    );
}

export default windowSize(FakeArtistCanvas);
