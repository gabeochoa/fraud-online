import React from "react";
import Select from 'react-select';

const BadDropdown = ({
    name,
    options,
    onChange,
    default_option,
    placeholder = "Select an option",
}) => {
    return (
        <Select
            name={name}
            options={options}
            onChange={onChange}
            value={default_option}
            placeholder={placeholder}
        />
    );
}

export default BadDropdown;