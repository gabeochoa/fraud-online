import React from "react";
import {mdiHeart } from '@mdi/js'
import Icon from '@mdi/react'
import './menu.css'

// TODO do we need to import styles here ? 

const Footer = props => (
    <>
        <div className="div_set">
            <hr className="hrstyle" />
            <h4 className="footer_font"> 
            Made with <Icon path={mdiHeart} size={"1em"}/> 
            By <a href="https://www.github.com/gabeochoa">@gabeochoa</a>
            </h4>
        </div>
    </>
);

export default Footer;