

import React, { Component } from 'react';
import './Tool.css'

class Tool extends Component {
  render() {
    return (<div className="Tool">
                <p>
                <img src="/img/fyrklover.png" alt="" /><span>{this.props.name}</span></p>
            </div>);
  }
}
export default Tool;
