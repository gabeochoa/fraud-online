import React from "react";
import "../components/menu.css";
import "../drawit/drawit.css";
import 'react-toastify/dist/ReactToastify.min.css';
import { ToastContainer, toast } from 'react-toastify';

const FakeArtistToastContainer = (props) => {
    const notify_round = () => {
        props.set_extra_game_state("round",
            props.extra_game_state.round + 1,
            () => { console.log("we should totally show a toast here") }
        )
    }
    const notify_artist = () => { console.log("we should totally show a toast here"); }
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
    const toasts = [
        {
            show: false,
            text: "Time for Drawing; One stroke only please!",
            position: toast.POSITION.BOTTOM_CENTER,
            onOpen: () => { },
            onClose: () => { },
        },
    ]
    return (
        <>
            <ToastContainer />
            {toasts.map((props) => {
                return !props.show
                    ? null
                    : toast.info(props.text, { props });
            })}
        </>
    );
}

export default FakeArtistToastContainer;