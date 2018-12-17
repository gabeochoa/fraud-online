import React, { Component } from "react";
import autobind from 'autobind-decorator'
import { CustomPicker, SliderPicker} from 'react-color';
import { Hue } from 'react-color/lib/components/common';

@autobind
class MyColorPicker extends Component {
  render() {
    return (
        <div>
            <Hue
                {...this.props}
                direction={'vertical'}
            />
        </div>
    );
  }
}

export default CustomPicker(MyColorPicker);