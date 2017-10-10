
import React, { Component } from 'react';
import './Caption.css'
class Caption extends Component {
  render() {

    return (<div className={this.props.strength?"Caption Strength-"+this.props.strength:"Caption"}>{this.props.content}</div>);
  }
}

export default Caption;
