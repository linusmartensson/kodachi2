
import Task from './Task'

import React, { Component } from 'react';
import './Toolbox.css'
import Tool from './Tool'
import {connect} from 'react-redux'
import { withRouter } from 'react-router-dom'

import {actions} from './reducers/root.js'

var List = (props) => {
    return (
        <div className="Tool">
            <input type="button" onClick={() => props.onListClick(props.list, props.history)} value={props.list.title} />
            </div>
    );
}
const ListContainer = connect(
    state => {return {}},
    dispatch => {
        return {onListClick: (list, history) => {
            dispatch(actions.app.list.show(list.id, history))
        }}
    }
)(withRouter(List));


class Toolbox extends Component {
  render() {
    
    const tools = this.props.tools.map((tool) => 
        <Tool key={tool.id} name={tool.title} task={tool.task} />
    );
    var tcount = 0, lcount = 0;
    const tasks = this.props.tasks.map((task) => {

        for(var v of task.type.inputs) {
            //Hide tasks that finish automatically, as long as they're showing.
           
            if(v.autocancel && this.props.currentTask && this.props.currentTask.task) return null;
            if(v.hide) return null;
        }
        if(task.result !== 'WAIT_RESPONSE') return null;

        tcount++;

        return (<Task key={task.id} task={task} data={{}} />)
    });
    const lists = this.props.lists.map((list) => {
        lcount++;
        return (<ListContainer key={list.id} list={list} />)        
    });

      var taskbox = tcount>0?<div className="Taskbox">{tasks}</div>:null;
      var listbox = lcount>0?<div className="Listbox">{lists}</div>:null;

    return (<div>{taskbox}{listbox}<div className="Toolbox">{tools}</div></div>);
  }
}

const ToolboxContainer = connect(
        state => {
            return {tools: state.session.tools?state.session.tools:[], tasks: state.session.tasks?state.session.tasks:[], lists: state.session.lists?state.session.lists:[], currentTask: state.currentTask}
        },
        dispatch => {
            return {};
        }
        )(Toolbox);
export default ToolboxContainer;
