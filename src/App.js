import React, { Component } from 'react';
import TimerScreen from './screens/timer'
import DataScreen from './screens/data'
import {css} from "emotion";

const root = css`
  text-align: center;
  font-family: Arial, Helvetica, sans-serif;
`;
const headerStyle = css`
  margin-top: 50px;
  margin-bottom: 50px;
`;

class App extends Component {
  state = {
    id: "cds",
    screen: "timer"
  }

  switchScreen = screen => {
    this.setState({screen})
  }

  render() {
    let screenToDisplay = undefined
    switch (this.state.screen) {
      case 'timer':
        screenToDisplay = <TimerScreen id={this.state.id} switchScreen={this.switchScreen} />;
        break;
      case 'data':
        screenToDisplay = <DataScreen id={this.state.id} switchScreen={this.switchScreen} />;
        break;
      default:
        console.log(`ERROR: unknown screen: ${this.state.screen}`)
    }
    return (
      <div className={root}>
        <h1 className={headerStyle}>{`Timer: ${this.state.id}`} </h1>
      {screenToDisplay}
      </div>
    )
  }
}

export default App;
