import React, {Component}  from "react";
import ReactDOM from "react-dom";
import DataProvider from "./DataProvider";
import Table from "./Table";

const list = [
  {
    'id': 1,
    'title': '1st Item',
    'description': 'Description here.'
  },
  {
    'id': 2,
    'title': '2nd Item',
    'description': 'Another description here.'
  },
  {
    'id': 3,
    'title': '3rd Item',
    'description': 'Third description here.'
  }
];

class BaseApplication extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      data: list,
      loaded: false, 
      placeholder: "Loading..."
     };

  }
  componentDidMount() {
    this.setState({ loaded: true });
  }

  render() {
    const { data, loaded, placeholder } = this.state;
    return loaded ? this.props.render(data) : <p>{placeholder}</p>;
  }
}

// const App = () => (
//   <BaseApplication 
//     render={data => <Table data={data} /> } />
// );

const App = () => (
  <DataProvider endpoint="api/package/" 
                render={data => <Table data={data} />} />
);

const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<App />, wrapper) : null;