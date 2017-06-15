
import React, { Component } from 'react';
import './Caption.css'
class Caption extends Component {
  render() {
    return (<div className="Caption">{this.props.content}</div>);
  }
}

export default Caption;
