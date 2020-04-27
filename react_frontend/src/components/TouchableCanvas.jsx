import React, { useRef, useEffect, useCallback } from 'react';
import '../components/menu.css';
import '../drawit/drawit.css';

const CLEAR = '__CLEAR';

let CANVAS = {
  width: 1000,
  height: 1000,
};

const normalizeTouchLocation = (evt, parent) => {
  var position = {};
  position.x = event.touches[0].clientX;
  position.y = event.touches[0].clientY;
  position.x -= parent.offsetLeft - parent.scrollLeft;
  position.y -= parent.offsetTop - parent.scrollTop;
  return position;
};

const _scale_coord = (coord) => {
  return {
    x: coord.x / CANVAS.width,
    y: coord.y / CANVAS.height,
  };
};

const _upscale_coord = (coord) => {
  return {
    x: coord.x * CANVAS.width,
    y: coord.y * CANVAS.height,
  };
};

const TouchableCanvas = (props) => {
  let past_positions = [];
  let mouse_clicked = false;
  let ctx = null;
  const canvasRef = useRef(null);

  useEffect(() => {
    canvasRef.current.height = canvasRef.current.clientHeight;
    canvasRef.current.width = canvasRef.current.clientWidth;
    CANVAS.width = canvasRef.current.width;
    CANVAS.height = canvasRef.current.height;
    ctx = canvasRef.current.getContext('2d');
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = props.tool.lineWidth;
  }, []);

  const onEventMove = (x, y) => {
    if (mouse_clicked) {
      let previous_position = past_positions.slice(-1)[0];
      // add to the list to send our boy
      past_positions.push({ x: x, y: y });
      if (previous_position == undefined) {
        previous_position = { x: x, y: y };
      }
      paint(previous_position, { x: x, y: y });
    }
  };

  const onEventBegin = (x, y) => {
    mouse_clicked = true;
    //always draw a dot on mouse down
    paint({ x: x, y: y }, { x: x, y: y });
    if (past_positions.length == 0) {
      past_positions.push({ x: x, y: y });
    }
  };

  const onEventEnd = () => {
    if (past_positions.length == 1) {
      // this is a dot boi
      paint(past_positions[0], past_positions[0]);
    }
    mouse_clicked = false;
    past_positions = [];
  };

  const onMouseDown = ({ nativeEvent }) => {
    const { offsetX: x, offsetY: y } = nativeEvent;
    // console.log("im down", x, y);
    onEventBegin(x, y);
  };

  const onMouseMove = ({ nativeEvent }) => {
    const { offsetX: x, offsetY: y } = nativeEvent;
    // console.log("im moving ", x, y, this.past_positions.length);
    onEventMove(x, y);
  };

  const onMouseUp = (event) => {
    if (event.target == canvasRef.current) {
      event.preventDefault();
    }
    onEventEnd();
  };

  const onTouchStart = (event) => {
    if (event.target == canvasRef.current) {
      event.preventDefault();
    }
    const { x, y } = normalizeTouchLocation(event, canvasRef.current);
    // console.log("touchstart", x, y)
    onEventBegin(x, y);
  };

  const onTouchEnd = (event) => {
    if (event.target == canvasRef.current) {
      event.preventDefault();
    }
    // console.log("touchend", event, event.touches, event.touches[0])
    onEventEnd();
  };

  const onTouchMove = (event) => {
    if (event.target == canvasRef.current) {
      event.preventDefault();
    }
    const { x, y } = normalizeTouchLocation(event, canvasRef.current);
    // console.log("touchmove", x, y)
    onEventMove(x, y);
  };

  const _paint = useCallback(
    (prev, cur, tool) => {
      // console.log("_paint", ctx, prev, cur, tool);
      const { x, y } = prev;
      const { x: x2, y: y2 } = cur;
      _drawOutline(cur, tool);
      ctx.beginPath();
      ctx.lineWidth = tool.lineWidth;
      ctx.strokeStyle = tool.stroke;
      // Move the the prevPosition of the mouse
      ctx.moveTo(x, y);
      // Draw a line to the current position of the mouse
      ctx.lineTo(x2, y2);
      // Visualize the line using the strokeStyle
      ctx.stroke();
    },
    [ctx]
  );

  const _drawOutline = (cur, tool) => {
    const { x, y } = cur;
    ctx.beginPath();
    ctx.arc(x, y, tool.lineWidth / 2, 0, 2 * Math.PI);
    ctx.fillStyle = tool.stroke;
    ctx.fill();
  };

  const paint = (prev, cur) => {
    // console.log("paint", prev, cur, props.is_local_player_artist);
    if (!props.is_local_player_artist) {
      return; // disable drawing when not local artist
    }
    // console.log("paint", prev, cur, props.tool)
    let scaled_prev = _scale_coord(prev);
    let scaled_cur = _scale_coord(cur);
    let scaled_tool = { ...props.tool };
    scaled_tool.lineWidth = props.tool.lineWidth / CANVAS.height;
    props.send_message({
      command: 'draw',
      message: { prev: scaled_prev, cur: scaled_cur, tool: scaled_tool },
    });
    _paint(prev, cur, props.tool);
  };

  // FUNCTIONS TO FORWARD TO CHILD REF
  const upscale_paint = useCallback(
    (prev, cur, tool) => {
      if (tool == CLEAR) {
        clear_canvas();
        return;
      }
      let upscaled_prev = _upscale_coord(prev);
      let upscaled_cur = _upscale_coord(cur);
      let upscaled_tool = { ...tool };
      upscaled_tool.lineWidth = Math.max(
        1,
        upscaled_tool.lineWidth * CANVAS.height
      );
      _paint(upscaled_prev, upscaled_cur, upscaled_tool);
    },
    [_paint]
  );

  const clear_canvas = useCallback(
    (send_message) => {
      if (send_message == undefined) {
        // this was in our parent comp but do we need it?
        console.warn('SEND MESSAGE undef? ');
        // send_message = true;
      }
      // clear ourselves, and then send the clear on the bus
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      if (send_message) {
        props.send_message({
          command: 'draw',
          message: { prev: null, cur: null, tool: CLEAR },
        });
      }
    },
    [canvasRef, ctx]
  );
  useEffect(() => {
    props.sendFunctions({ upscale_paint, clear_canvas });
  }, [upscale_paint, clear_canvas]);
  /////////////////////////////////////

  return (
    <div className="canvas_wrapper_wrapper">
      <div className="canvas_wrapper">
        <canvas
          className="canvas_style"
          ref={canvasRef}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseUp}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onTouchMove={onTouchMove}
        >
          Your browser does not support the HTML 5 Canvas.
        </canvas>
      </div>
    </div>
  );
};

export default TouchableCanvas;
