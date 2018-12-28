import React, {Component} from "react";
import CreateGame from "../components/CreateGame";
import autobind from "autobind-decorator";
import BadInputField from "../components/BadInputField";


@autobind
class CreateFakeArtistGame extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            rounds: 2,
        }

        this.props.set_game_option("rounds", 2)
    }

    handleStrChange(event){
        if(event.target === undefined){
            console.log(event)
            return [false, null];
        }
        var validRE = /^\d{1,10}$/;
        if(event.target.value.match(validRE) == null){
            return [true, "Not a valid number"];
        }
        else{
            this.props.set_game_option("rounds", parseInt(event.target.value))
            return [false, null];
        }
    }

    render(){
        return (
            // im a little concerned about infinite props
            // but theres like 30 things in there so i dont wanna type it
            <CreateGame {...this.props}>
                <p>Number of Rounds: </p>
                <BadInputField
                    inherit_create_game_props={true}
                    name="rounds" 
                    value={this.state.rounds} 
                    onChange={this.handleStrChange} 
                    type="text" placeholder="2"
                />
            </CreateGame>
        );
    }
}

export default CreateFakeArtistGame;