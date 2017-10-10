import React, { Component } from 'react';
import './SpeechBubble.css'
class SpeechBubble extends Component {
  render() {

    const speaker = this.props.speaker?<img src={this.props.speaker} alt="" />:<img src='/img/kodachi_lores2.png' alt="" />;


    var content = "";
    
    if(this.props.position === "right"){
        content = <div className="SpeechBubble SpeechBubble-right"><div className="SpeechBubble-inner">{this.props.text}</div>{speaker}</div>;
    } else {
        content = <div className="SpeechBubble SpeechBubble-left">{speaker}<div className="SpeechBubble-inner">{this.props.text}</div></div>;
    }

    return content;
  }
}

export default SpeechBubble;
