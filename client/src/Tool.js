
import {actions} from './reducers/root.js'

import React, { Component } from 'react';
import './Tool.css'
import {connect} from 'react-redux'

class Tool extends Component {
  render() {
    return (<div className="Tool">
                <p>
                    <img src="/img/fyrklover.png" alt="" /><input type="button" onClick={() => this.props.onTaskClick(this.props.task)} value={this.props.name} />
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
                onTaskClick: (t) => {
                    dispatch(actions.app.task.start.do(t));
                }
            }
        }
        )(Tool);
export default ToolContainer;
