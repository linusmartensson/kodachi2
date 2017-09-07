

import React, { Component } from 'react';
import './Toolbox.css'
import Tool from './Tool'

class Toolbox extends Component {
  render() {
    
    const tools = this.props.tools.map((tool) => 
        <Tool key={tool.id} name={tool.title} />
    );

    return (<div className="Toolbox">{tools}</div>);
  }
}
export default Toolbox;
