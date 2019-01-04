import React, { Component } from "react";
import { cx, css } from "emotion";
import { signIn, loadData } from "../utils/firebase";
import WaitTable from "../components/WaitTable";
import WaitChart from "../components/WaitChart";


const buttonStyle = css`
  font-family: Arial, Helvetica, sans-serif;
  height: 70px;
  color: white;
  font-size: 20px;
  width: 300px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 50px;
  margin-top: 20px;
  border-radius: 10px;
  border: 0 solid #00aa66;
  background-color: green;
`;

const linkStyle = css`
  margin-top: 100px;
  font-size: 15px;
  height: 60px;
  width: 200px;
  background-color: blue;
`;

class DataScreen extends Component {
  state = {
    data: [],
    smoothed: []
  };

  componentDidMount() {
    signIn(() => loadData(this.props.id, this.setState.bind(this)));
  }

  render() {
    let tableData = this.state.data;
    tableData.sort((a, b) => {
      if (a.when < b.when) {
        return 1;
      } else if (a.when > b.when) {
        return -1;
      } else {
        return 0;
      }
    });

    return (
      <div>
        <WaitChart data={this.state.data} />
        <WaitTable data={tableData.slice(0, 5)} />
        <button className={cx(buttonStyle, linkStyle)} onClick={() => this.props.switchScreen('timer')}>
          Timer
        </button>
      </div>
    );
  }
}

export default DataScreen;
