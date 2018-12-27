
import Task from './Task'

import React, { Component } from 'react';
import './Toolbox.css'
import Tool from './Tool'
import {connect} from 'react-redux'
import { withRouter } from 'react-router-dom'

import {actions} from './reducers/root.js'

var _ = require('lodash');
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
    
    var sortfn = (a,b) => {
        var A = a.title || a.name || a.id;
        var B = b.title || b.name || b.id;
        return A<B?-1:A>B?1:0;
    }


    const tools = _.cloneDeep(this.props.tools).sort(sortfn).map((tool) => 
        <Tool key={tool.id} name={tool.title} task={tool.task} />
    );
    var tcount = 0, lcount = 0;
    const tasks = _.cloneDeep(this.props.tasks).sort(sortfn).map((task) => {

        /*for(var v of task.type.inputs) {
            //Hide tasks that finish automatically, as long as they're showing.
           
            if(v.autocancel && this.props.currentTask && this.props.currentTask.task) return null;
        }*/
        if(task.result !== 'WAIT_RESPONSE') return null;

        tcount++;

        return (<Task key={task.id} task={task} data={{}} />)
    });
    const lists = _.cloneDeep(this.props.lists).sort(sortfn).map((list) => {
        lcount++;
        return (<ListContainer key={list.id} list={list} />)        
    });


    const externs = [ 
          <div className="Tool" key="kaiLink"><a href="https://kai.kodachi.se/kai">Besök Kodachikai!</a></div>,
          <div className="Tool" key="schemaLink"><a href="https://schema.kodachi.se">Schema för Kodachicon!</a></div>
    ];
      var taskbox = tcount>0?<div className="Taskbox">{tasks}</div>:null;
      var listbox = lcount>0?<div className="Listbox">{lists}</div>:null;
      var toolbox = tools.length>0?<div className="Toolbox">{tools}</div>:null;
      var extern = externs.length>0?<div className="Externbox">{externs}</div>:null;

    return (<div>{taskbox}{toolbox}{listbox}{extern}</div>);
  }
}

const ToolboxContainer = connect(
        state => {
            return {tools: state.app.session.tools?state.app.session.tools:[], tasks: state.app.session.tasks?state.app.session.tasks:[], lists: state.app.session.lists?state.app.session.lists:[]}
        },
        dispatch => {
            return {};
        }
        )(Toolbox);
export default ToolboxContainer;
