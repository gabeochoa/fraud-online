import React from "react";
import About from '../components/About';

const DrawitAbout = (props) => {
    const handleClick = (event) => {
        while (event.target.getAttribute("name") === null) { event.target = event.target.parentNode; }
        let button = event.target.getAttribute("name");
        switch (button) {
            case "about_back": props.changeLocation("_back", () => { }); break;
            default: console.log("button was clicked : " + button); break
        }
    }
    return (
        <>
            <About
                header_text={<p></p>}
                body={
                    <div style={{ textAlign: "left" }}>
                        <ul style={{ listStyleType: "disc" }}>
                            <li>Draw My Meme is based on the various pictionary drawing online games</li>
                            <li>The current artist will be assigned a word and they will draw it </li>
                            <li>The other players should try to guess what the word is</li>
                            <li>Each player gets one try to draw their word </li>
                            <li>Once everyone draws, the game ends. </li>
                        </ul>
                    </div>
                }
                footer_text={
                    <h6 style={{ fontSize: "0.75em" }}>
                        If you enjoyed this game, please check out the other games on this site :)
                    </h6>
                }
            />
            <hr />
            <a name="about_back" className="button is-outlined button_style button_font"
                onClick={handleClick}
                style={button_stretch}
            >
                Back
            </a>
        </>
    );
}

const button_stretch = {
    width: "40%", // 1/X where x is num of buttons
}

export default DrawitAbout