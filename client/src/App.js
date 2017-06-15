import React, { Component } from 'react';
import './App.css';

import Workspace from './Workspace';
//import InfoPopup from './InfoPopup';
//import Achievement from './Achievement';
//import TaskPopup from './TaskPopup';

class App extends Component {
  render() {
    //const extras = 
   //     (<div>
    //    <InfoPopup />
     //   <Achievement />
      //  <TaskPopup /> </div>);
    return (
      <div className="App">
        <Workspace />
      </div>
    );
  }
}

export default App;
