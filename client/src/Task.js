import React from 'react';
import {connect} from 'react-redux'

import {actions} from './reducers/root.js'
import {Link} from 'react-router-dom';




            //<input type="button" onClick={() => props.onTaskClick(props.task, props.data)} value={props.task.title} />
function Task(props){
    return (
            <div className="Tool"> 
                <Link to={"/task/"+props.task.id}>{props.task.title}</Link>
            </div>);
}

const TaskContainer = connect(
    state => {return {}},
    dispatch => {
        return {onTaskClick: (task, data)=>{
            dispatch(actions.app.task.showasync(task.id, data))
        }}
    }
)(Task);

export default TaskContainer;


