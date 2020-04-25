import React, { Component, useState, useEffect } from "react";
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

const BaseApplication = (props) => {
  const [loaded, setLoaded] = useState(false);
  const [placeholder, setPlaceholder] = useState("Loading...");
  useEffect(() => {
    setLoaded(true)
  }, []);
  return (
    !loaded
      ? <p>{placeholder}</p>
      :
      <div>
        <DataProvider endpoint="api/package/"
          render={data => <Table data={data} />} />
        <DataProvider endpoint="api/game/"
          render={data => <Table data={data} />} />
      </div>
  );
}

const App = () => (
  <BaseApplication render={data => <Table data={data} />} />
);

const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<App />, wrapper) : null;