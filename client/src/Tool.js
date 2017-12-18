
import {actions} from './reducers/root.js'

import React, { Component } from 'react';
import './Tool.css'
import {connect} from 'react-redux'

class Tool extends Component {
  render() {
    return (<div className="Tool">
                <p>
                    <input type="button" onClick={() => this.props.onTaskClick(this.props.task, this.props.data)} value={this.props.name} />
                </p>
            </div>);
  }
}
const ToolContainer = connect(
        state => {
            return {}
        },
        dispatch => {
            return {
                onTaskClick: (t, d) => {
                    dispatch(actions.app.task.start.do(t, d));
                }
            }
        }
        )(Tool);
export default ToolContainer;
