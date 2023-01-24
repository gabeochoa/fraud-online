import React from "react";
import { CustomPicker} from 'react-color';
import { Hue } from 'react-color/lib/components/common';

const MyColorPicker = (props) => {
  return (
    <div>
      <Hue
        {...props}
        direction={'vertical'}
      />
    </div>
  );
}

export default CustomPicker(MyColorPicker);