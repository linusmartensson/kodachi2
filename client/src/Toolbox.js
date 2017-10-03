

import React, { Component } from 'react';
import './Toolbox.css'
import Tool from './Tool'
import {connect} from 'react-redux'


import {actions} from './reducers/root.js'
function Task(props){
    return (
            <div className="Tool"> 
            <img src="/img/fyrklover.png" alt="" /><input type="button" onClick={() => props.onTaskClick(props.task)} value={"handle_task_"+props.task.task_name} />
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
    const tasks = this.props.tasks.map((task) => 
        <TaskContainer key={task.id} task={task} />
    );

    return (<div className="Toolbox">{tasks}{tools}</div>);
  }
}

const ToolboxContainer = connect(
        state => {
            return {tools: state.session.tools?state.session.tools:[], tasks: state.session.tasks?state.session.tasks:[]}
        },
        dispatch => {
            return {};
        }
        )(Toolbox);
export default ToolboxContainer;
