

import React, { Component } from 'react';
import './Toolbox.css'
import Tool from './Tool'
import {connect} from 'react-redux'

class Toolbox extends Component {
  render() {
    
    const tools = this.props.tools.map((tool) => 
        <Tool key={tool.id} name={tool.title} />
    );

    return (<div className="Toolbox">{tools}</div>);
  }
}

const ToolboxContainer = connect(
        state => {
            return {tools: state.session.tools?state.session.tools:[]}
        },
        dispatch => {

        }
        )(Toolbox);
export default ToolboxContainer;
