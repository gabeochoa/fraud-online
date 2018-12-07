import React, { Component } from "react";

//https://stackoverflow.com/a/53623366
export default function windowSize(WrappedComponent) {
    return class extends Component {
        state = { width: 1000, height: 1000 };

        componentDidMount() {
            this.updateWindowDimensions();
            window.addEventListener("resize", this.updateWindowDimensions);
        }

        componentWillUnmount() {
            window.removeEventListener("resize", this.updateWindowDimensions);
        }

        updateWindowDimensions = () => {
            this.setState({ width: window.innerWidth, height: window.innerHeight });
        };

        render() {
            return (
                <WrappedComponent
                    {...this.props}
                    windowWidth={this.state.width}
                    windowHeight={this.state.height}
                    isMobileSized={this.state.width < 700}
                />
            );
        }
    };
}