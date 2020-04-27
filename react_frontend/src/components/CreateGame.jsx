import React, { Component, useState } from "react";
import autobind from 'autobind-decorator';
import PropTypes from 'prop-types';
import { makeid } from '../drawit/utils';
import "./menu.css";

const CreateGame = (props) => {
    const [name, setName] = useState(props.username || "");
    const [badInput, setBadInput] = useState(false);
    const [errMsg, setErrMsg] = useState(null);

    const set_bad_input = (state, err_msg) => {
        setBadInput(state);
        setErrMsg(err_msg);
    }
    const handleChange = (event) => {
        var name = event.target.name;
        if (name == "name") { setName(event.target.value); }
    }
    const handleClick = (event) => {
        while (event.target.getAttribute("name") === null) { event.target = event.target.parentNode; }
        let button = event.target.getAttribute("name"); // console.log("button was clicked ", button)
        switch (button) {
            case "create_create":
                if (!badInput) {
                    props.changeUsername(name, () => { });
                    // must happen before location change ? 
                    props.changeRoomCode(makeid(), () => { });
                    props.changeLocation("lobby", () => { });
                }
                break;
            case "create_back":
                props.changeUsername(name, () => { });
                props.changeLocation("_back", () => { /* console.log("Change location menu") */ });
                break;
            default:
                console.log("button was clicked : " + button);
                break
        }
    }

    const render_children = () => {
        let props_for_children = { ...props }
        // certain elements cant have children; we also shouldnt give all children to our children
        delete props_for_children['children']
        const children = React.Children.map(props.children, (child, index) => {
            const child_props = {
                ...props_for_children,
                set_bad_input: set_bad_input,
            }
            if (child.props.inherit_create_game_props) {
                return React.cloneElement(child, child_props);
            }
            else { return React.cloneElement(child, {}); }
        });
        return children;
    }
    return (
        <>
            <div className="div_set">
                <input
                    name="name"
                    className="input input_style"
                    value={name}
                    onChange={handleChange}
                    type="text" placeholder="Name"
                />
                {badInput 
                    ? <p style={{ color: "red" }}> {errMsg}</p>
                    : <p></p>
                }
                {render_children()}
                <hr className="hrstyle" />
                <a
                    name="create_create"
                    className="button is-outlined button_style button_font"
                    onClick={handleClick}
                    style={button_stretch}
                >
                    Create
                </a>
                <a
                    name="create_back"
                    className="button is-outlined button_style button_font"
                    onClick={handleClick}
                    style={button_stretch}
                >
                    Back
                </a>
            </div>
        </>
    );
}

const button_stretch = {
    width: "40%", // 1/X where x is num of buttons
}

export default CreateGame;