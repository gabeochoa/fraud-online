import React from "react";

const BadInputField = (props) => {
    const onChange = (event) => {
        const response = props.onChange(event);
        const success = response[0];
        const err = response[1];
        props.set_bad_input(success, err);
    };
    return (
        <input
            name={props.name}
            className="input input_style"
            value={props.minutes}
            onChange={onChange}
            type={props.type}
            placeholder={props.placeholder}
        />
    );
}

export default BadInputField;