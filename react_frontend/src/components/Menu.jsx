import React, {Component} from "react";
import autobind from 'autobind-decorator';
import PropTypes from 'prop-types';
// TODO move to component utils? 
import {filterBadProps} from '../drawit/utils';

const FIRST_ELEM = "__DEFAULT__";

@autobind
class Menu extends Component {

    constructor(props){
        super(props);
        console.log(props)

        this.prev_locations = [FIRST_ELEM, this.props.starting_location]

        this.state = {
            location: this.props.starting_location,
        }
    }

    changeLocation(new_location, callback){
        if(callback == undefined){
            callback = ()=>{};
        }
        console.log("change location", this.state.location, new_location);

        if(new_location == "_back"){
            // user wants to go back from here 
            // bring them to the previous place
            let prev_location = this.prev_locations.pop();
            if(prev_location == FIRST_ELEM){
                // we are at the root menu, do nothing
                this.prev_locations.push(FIRST_ELEM)
                return
            }
            // otherwise, we need to just send the user to the new place
            this.setState({
                location: prev_location
            }, callback)
            return
        }
        // if they arent going back, lets add the location to our stack
        // then send the user there. 
        this.prev_locations.push(this.state.location);
        this.setState({
            location: new_location
        }, callback);
    }

    render(){
        let content = <p>DEFAULT CASE</p>;
        if(this.state.location == undefined){
            return content;
        }
        const iteritems = Object.entries(this.props.all_locations);
        for (let [key, value] of iteritems){
            // console.log(key, this.state.location)
            if(key == this.state.location){
                content = value;
                break;
            }
        }
        const child_props = {
            // ...this.props,
            changeLocation: this.changeLocation,
        }
        const matching_props = child_props;//filterBadProps(child_props)
        return (
            <div id="button_bar" className="field is-centered button_bar_style">
                {this.props.header}
                {React.cloneElement(content, matching_props)}
                {this.props.footer}
            </div>
        );
    }
}

Menu.propTypes = {
    start_location: PropTypes.string,
    all_locations: PropTypes.object,
}

export default Menu;