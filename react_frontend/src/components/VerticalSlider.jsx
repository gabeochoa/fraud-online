import React, { useState } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/lab/Slider';

const styles = {
  root: {
    display: 'flex',
    height: 300,
  },
  slider: {
    padding: '0px 22px',
  },
};

const VerticalSlider = (props) => {
  const [value, setValue] = useState(props.value || props.min || 3);
  const handleChange = (_event, value) => {
    setValue(value)
    props.onChange(value)
  };
  return (
    <div className={props.classes.root}>
      <Slider
        min={props.min}
        max={props.max}
        step={props.step}
        classes={{ container: props.classes.slider }}
        onChange={handleChange}
        value={value}
        vertical
      />
    </div>
  );
}

export default withStyles(styles)(VerticalSlider);