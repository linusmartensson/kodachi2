

import React, { Component } from 'react';
import './Toolbox.css'
import Tool from './Tool'
import {connect} from 'react-redux'


import {actions} from './reducers/root.js'
function Task(props){
    return (
            <div className="Tool"> 
            <img src="/img/fyrklover.png" alt="" /><input type="button" onClick={() => props.onTaskClick(props.task)} value={props.task.title} />
            </div>);
}

const TaskContainer = connect(
        state => {return {}},
        dispatch => {
            return {onTaskClick: (task)=>{
                dispatch(actions.app.task.show(task.id))
            }}
        }
        )(Task);

class Toolbox extends Component {
  render() {
    
    const tools = this.props.tools.map((tool) => 
        <Tool key={tool.id} name={tool.title} task={tool.task} />
    );
    const tasks = this.props.tasks.map((task) => {

        for(var v of task.type.inputs) {
            //Hide tasks that finish automatically, as long as they're showing.
            if(v.autocancel && this.props.currentTask) return null;
        }


        return (<TaskContainer key={task.id} task={task} />)
    });

    return (<div className="Toolbox">{tasks}{tools}</div>);
  }
}

const ToolboxContainer = connect(
        state => {
            return {tools: state.session.tools?state.session.tools:[], tasks: state.session.tasks?state.session.tasks:[], currentTask: state.currentTask}
        },
        dispatch => {
            return {};
        }
        )(Toolbox);
export default ToolboxContainer;
