import React from 'react';
import './Toolbox.css'
import {connect} from 'react-redux'

import {actions} from './reducers/root.js'




function Task(props){
    return (
            <div className="Tool"> 
            <input type="button" onClick={() => props.onTaskClick(props.task, props.data)} value={props.task.title} />
            </div>);
}

const TaskContainer = connect(
    state => {return {}},
    dispatch => {
        return {onTaskClick: (task, data)=>{
            dispatch(actions.app.task.show(task.id, data))
        }}
    }
)(Task);

export default TaskContainer;


