
import React, { Component } from 'react';
import './Achievement.css'
class Achievement extends Component {
  render() {

    return (
            <div className="Achievement">
              <div className="Achievement-inner">
                <img src="/img/fyrklover.png" alt="" />
                <div className="Achievement-text">
                <p>Best Noob Ever</p>
                <p className="Achivement-points">+100 points!</p>
                </div>
              </div>
            </div>);
  }
}

export default Achievement;
