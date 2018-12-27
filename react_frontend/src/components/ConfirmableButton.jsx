import React, { Component } from "react";
import Button from '@material-ui/core/Button';
import autobind from 'autobind-decorator'
import SweetAlert from 'react-bootstrap-sweetalert';
import "./menu.css";
import "../drawit/drawit.css";

@autobind
class ConfirmableButton extends Component{

    constructor(props){
        super(props);

        this.state = {
            confirm_box: null,
        }
        ///props///// 
        // name
        // onClick
        // buttonProps
    }

    closeConfirmBox(){
        this.setState({confirm_box: null})
    }

    openConfirmBox(){
        this.setState({
            confirm_box: (
                <SweetAlert
                    warning
                    showCancel
                    confirmBtnText={"Yes"}
                    confirmBtnBsStyle="warning"
                    cancelBtnBsStyle="default"
                    title="Are you sure?"
                    onConfirm={() => { this.props.onClick(this.props.name); this.closeConfirmBox() }}
                    onCancel={ () => {this.closeConfirmBox()}}
                    closeOnClickOutside={true}
                    >
                    {this.props.buttonProps.confirm_text}
                </SweetAlert>
            ),
        });
    }

    render(){
        return (
            <React.Fragment>
            {this.state.confirm_box != null && this.state.confirm_box}
            <Button 
                {... this.props.buttonProps}
                onClick={this.openConfirmBox}
            >
                    {this.props.children}
            </Button>
            </React.Fragment>
        );
    }
}

export default ConfirmableButton;