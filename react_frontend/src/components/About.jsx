import React from 'react'

const About = ({
    header_text = <h1>Placeholder Header</h1>,
    body = <p>Placeholder Body</p>,
    footer_text = <h6>Placeholder Footer</h6>,
}) => {
    return (
        <div style={{
            paddingLeft: "10%",
            paddingRight: "10%"
        }}>
            {header_text}
            {body}
            {footer_text}
        </div>
    );
}

export default About;