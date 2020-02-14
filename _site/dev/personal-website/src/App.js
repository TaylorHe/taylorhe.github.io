import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';



class App extends Component {
  constructor(props, context) {
    super(props, context);
    this.imgsrc = './assets/img/me2.jpg'
  }

  render() {
    return (

      <div className="App">
        <header className="App-header">
          <img src={this.imgsrc} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <img src={this.imgsrc} />
        
      </div>
    );
  }
}

export default App;
