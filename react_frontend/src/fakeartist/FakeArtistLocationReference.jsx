import React from 'react';
import '../components/menu.css';
import '../drawit/drawit.css';
import SweetAlert from 'react-bootstrap-sweetalert/lib/dist/SweetAlert';

const column_list = {
  columnCount: 2,
  columnGap: '3px',
  columnRuleColor: 'white',
  columnRuleStyle: 'solid',
  columnRuleWidth: '10px',
};
const column_list_item = {
  padding: '0 0 0 10px',
  margin: '0 0 4px 0',
  backgroundColor: '#f0f0f0',
  columnSpan: '1',
  wordWrap: 'break-word',
};

const pretty_location = (location) => {
  return location == null || location == undefined || location == ''
    ? location
    : location
      .split('_')
      .map((item) => {
        return item.charAt(0).toUpperCase() + item.slice(1);
      })
      .join(' ');
};

const FakeArtistLocationReference = (props) => {
  const renderPlace = (place) => {
    const place_text = (
      place[1]
        ? (
          <p style={{ color: '#bbb', textDecoration: 'line-through' }}>
            {' '}{pretty_location(place[0])}{' '}
          </p>
        )
        : <p> {pretty_location(place[0])} </p>
    );
    return (
      <li
        key={place[0]}
        name={place[0]}
        onClick={props.handleClickLocation}
        style={column_list_item}
      >
        {place_text}
      </li>
    );
  };
  return !props.show_modal ? null : (
    <SweetAlert
      title={'Locations'}
      style={{
        // top: "-1em",
        position: 'absolute',
        overflowY: 'scroll',
        top: '45%',
        touchAction: 'auto',
        pointerEvents: 'auto',
      }}
      confirmBtnText={'close locations'}
      onConfirm={props.onConfirm}
      onCancel={props.onConfirm}
    >
      <ul style={column_list}>
        {props.locations && props.locations.map((place) => renderPlace(place))}
      </ul>
    </SweetAlert>
  );
};

export default FakeArtistLocationReference;