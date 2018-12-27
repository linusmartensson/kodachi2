import React, { Component } from 'react';
import SpeechBubble from './SpeechBubble'
import './InfoPopup.css'
import {connect} from 'react-redux'
class InfoPopup extends Component {
  render() {

    if(!this.props.msg) return null;
    return (
            <div className="InfoPopup">
              <div className="InfoPopup-inner">
                <SpeechBubble speaker="/img/kodachi_lores2.png" text={this.props.msg} />
              </div>
            </div>);
  }
}

export default connect(state => ({msg: state.app.currentMessage}),dispatch=>({}))(InfoPopup);
