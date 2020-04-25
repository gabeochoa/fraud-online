import React from "react";
import About from '../components/About';

const SpyfallAbout = ({
    changeLocation
}) => {
    const handleClick = (event) => {
        while (event.target.getAttribute("name") === null) {
            event.target = event.target.parentNode;
        }
        let button = event.target.getAttribute("name");
        switch (button) {
            case "about_back":
                changeLocation("_back", () => { });
                break;
            default:
                console.log("button was clicked : " + button);
                break
        }
    };

    return (
        <>
            <About
                body={
                    <div style={{ textAlign: "left" }}>
                        <ul style={{ listStyleType: "disc" }}>
                            <li>Spyfall is a ripoff of the best phone based game known to mankind</li>
                            <a href="https://spyfall.crabhat.com">Crabhat Spyfall</a>
                        </ul>
                    </div>
                }
                header_text={<p></p>}
                footer_text={
                    <h6 style={{ fontSize: "0.75em" }}>
                        If you enjoyed this game, please check out the other games on this site :) 
                    </h6>
                }
            />
            <hr />
            <a name="about_back" className="button is-outlined button_style button_font"
                onClick={handleClick}
                style={{
                    width: "40%", // 1/X where x is num of buttons
                }}
            >Back</a>
        </>
    );
}


export default SpyfallAbout
