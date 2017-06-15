import React, { Component } from 'react';
import './Avatar.css'
class Avatar extends Component {
  render() {
    return (
            <div className="Avatar">
                <img src={this.props.icon} alt="" />
            </div>);
  }
}

export default Avatar;
