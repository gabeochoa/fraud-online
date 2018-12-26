import React, {Component} from "react";
import CreateGame from "../components/CreateGame";
import autobind from "autobind-decorator";
import BadInputField from "../components/BadInputField";


@autobind
class CreateSpyfallGame extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            minutes: 5,
        }

        // set default timer
        this.props.set_game_option("timer", 5*60)
    }

    handleTimerChange(event){
        console.log("timer change", event)
        if(event.target === undefined){
            console.log(event)
            return [false, null];
        }
        var validRE = /^\d{1,10}$/;
        if(event.target.value.match(validRE) == null){
            return [true, "Not a valid number"];
        }
        else{
            this.props.set_game_option("timer", parseInt(event.target.value)*60)
            return [false, null];
        }
    }

    render(){
        return (
            // im a little concerned about infinite props
            // but theres like 30 things in there so i dont wanna type it
            <CreateGame {...this.props}>
                <p>Enter a number in minutes: </p>
                <BadInputField
                    inherit_create_game_props={true}
                    name="minutes" 
                    value={this.state.minutes} 
                    onChange={this.handleTimerChange} 
                    type="text" placeholder="5"
                />
            </CreateGame>
        );
    }
}

export default CreateSpyfallGame;