
import React, { Component } from 'react';
import Panel from './Panel';
import './TaskPopup.css'


class TaskPopup extends Component {
  render() {
    return (<div className="TaskPopup">
                <div className="TaskPopup-item">
                    <Panel />
                </div>
            </div>);
  }
}
export default TaskPopup;
