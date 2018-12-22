import React, {Component} from "react";
import autobind from 'autobind-decorator';
import Lobby from '../components/Lobby';


@autobind
class LobbySpyfall extends Component{

    constructor(props){
        super(props);
    }

    componentDidMount(){
        this.props.register_socket_callbacks("lobby_spyfall", 
                                             "onmessage", 
                                             (data) => {this.process_message(data)});
    }

    componentWillUnmount(){
        this.props.unregister_socket_callbacks("lobby_spyfall", "onmessage");
    }

    process_message(parsedData){
        console.log("lobby_spyfall process_message", parsedData);

        const command = parsedData.command;
        const message = parsedData.message;
        const sender = parsedData.sender;
        
        let locations = this.props.extra_game_state.locations;
        if(locations && locations.length == 0){
            locations = [...message.locations].map((item)=>{return [item, false]})
        }else{
            locations = [];
        }
        this.props.set_extra_game_state("locations", locations);
        this.props.set_extra_game_state("total_time", message.minutes * 60);
    }

    render(){
        return(
            <Lobby {... this.props}>
            </Lobby>
        )
    }
}

export default LobbySpyfall;