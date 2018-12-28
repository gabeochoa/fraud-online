import React from 'react'

function About(props){
    return (
        <div style={{
            paddingLeft: "10%",
            paddingRight: "10%"
            }}>

            {props.header_text || <h1>Placeholder Header</h1>}
            {props.body || <p>Placeholder Body</p>}
            {props.footer_text || <h6>Placeholder Footer</h6>}
        </div>
    );
}

export default About;