import React, { Component } from 'react';
import SpeechBubble from './SpeechBubble'
import './InfoPopup.css'
class InfoPopup extends Component {
  render() {

    return (
            <div className="InfoPopup">
              <div className="InfoPopup-inner">
                <SpeechBubble speaker="/img/kodachi_lores2.png" text="Hey! There's a thing that happened!!" />
              </div>
            </div>);
  }
}

export default InfoPopup;
