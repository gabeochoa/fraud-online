import React from "react";

const divStyle = {
    margin: '40px',
    border: '5px solid white'
};

const Container = (props) => {
    return (
        <div style={divStyle}>
            {this.props.children}
        </div>
    );
}
export default Container;