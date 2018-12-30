import React, { Component } from 'react';
import TimerScreen from './screens/timer'
import DataScreen from './screens/data'

class App extends Component {
  state = {
    screen: "timer"
  }

  switchScreen = screen => {
    this.setState({screen})
  }

  render() {
    switch (this.state.screen) {
      case 'timer':
        return <TimerScreen  switchScreen={this.switchScreen} />
      case 'data':
        return <DataScreen />
      default:
        console.log(`ERROR: unknown screen: ${this.state.screen}`)
    }
  }
}

export default App;
