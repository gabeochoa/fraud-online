import React, { useState } from "react";
import Button from '@material-ui/core/Button';
import SweetAlert from 'react-bootstrap-sweetalert';
import "./menu.css";
import "../drawit/drawit.css";

const ConfirmableButton = (props) => {
    const [confirmBox, setConfirmBox] = useState(null);
    const closeConfirmBox = () => { setConfirmBox(null); }
    const openConfirmBox = () => {
        setConfirmBox(
            <SweetAlert
                warning
                showCancel
                confirmBtnText={"Yes"}
                confirmBtnBsStyle="warning"
                cancelBtnBsStyle="default"
                title="Are you sure?"
                onConfirm={() => { props.onClick(props.name); closeConfirmBox() }}
                onCancel={closeConfirmBox}
                closeOnClickOutside={true}
            >
                {props.buttonProps.confirm_text}
            </SweetAlert>
        );
    }
    return (
        <>
            {confirmBox}
            <Button
                {...props.buttonProps}
                onClick={openConfirmBox}
            >
                {props.children}
            </Button>
        </>
    );
}

export default ConfirmableButton;