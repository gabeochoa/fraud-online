import React, {Component} from "react";
import CreateGame from "../components/CreateGame";
import autobind from "autobind-decorator";
import BadDropdown from "../components/BadDropdown";


@autobind
class CreateDrawGame extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            minutes: 5,
        }

        this.dropdown_choices = [
            {value: 'memes', label: 'Memes'},
            {value: 'normal_words', label: 'Normal Words'},
        ]
    }

    handleDropdownChange(event){
        console.log("handleDropdownChange", event)
        this.props.set_game_option("wordset", event.value);
        return [false, null];
    }

    render(){
        return (
            // im a little concerned about infinite props
            // but theres like 30 things in there so i dont wanna type it
            <CreateGame {...this.props}>
                <p>Choose a word set: </p>
                <BadDropdown
                    name="word_set"
                    inherit_create_game_props={true}
                    options={this.dropdown_choices}
                    value={this.dropdown_choices[0]}
                    onChange={this.handleDropdownChange}
                />
            </CreateGame>
        );
    }
}

export default CreateDrawGame;