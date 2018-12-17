import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/lab/Slider';
import autobind from 'autobind-decorator';

const styles = {
  root: {
    display: 'flex',
    height: 300,
  },
  slider: {
    padding: '0px 22px',
  },
};

@autobind
class VerticalSlider extends Component {

    constructor(props){
        super(props)

        this.state = {
            value: this.props.default || this.props.min || 3,
        }
    }

    handleChange(event, value) {
        var name = event.target.name;
        this.setState({ value });
        this.props.onChange(value)
    }

    render(){
        return (
            <div className={this.props.classes.root}>
                <Slider
                    min={this.props.min}
                    max={this.props.max}
                    step={this.props.step}
                    classes={{container: this.props.classes.slider}}
                    onChange={this.handleChange}
                    value={this.state.value}
                    vertical
                />
            </div>
        );
    }
}

VerticalSlider.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(VerticalSlider);