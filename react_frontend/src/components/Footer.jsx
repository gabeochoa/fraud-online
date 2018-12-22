import React from "react";
import {mdiHeart } from '@mdi/js'
import Icon from '@mdi/react'

// TODO do we need to import styles here ? 

const Footer = props => (
    <React.Fragment>
        <div className="div_set">
            <hr className="hrstyle" />
            <h4 style={{fontSize: 10}}> 
            Made with <Icon path={mdiHeart} size={0.5}/> 
            By <a href="https://www.github.com/gabeochoa">@gabeochoa</a>
            </h4>
        </div>
    </React.Fragment>
);

export default Footer;