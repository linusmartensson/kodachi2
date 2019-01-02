
import Task from './Task'

import React, { Component } from 'react';
import Tool from './Tool'
import {connect} from 'react-redux'
import { withRouter } from 'react-router-dom'

import {actions} from './reducers/root.js'

import StoredPage from './StoredPage'

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

    var books = {};
    var bp = this.props.books;
    
    for(var v of bp){
        if(!books[v.group]) books[v.group] = [];

        books[v.group].push(v);
    }
    var q = [];
    for(var b in books){
        var bs = books[b];
        var group = bs[0].group;
        var storedPages = bs.map((book) => <StoredPage key={book.id} name={book.title} path={"/book/"+book.path} />);
        q.push({group, storedPages});
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

    q = q.map(v => <div key={v.group} className="Pages">{v.storedPages}</div>);

    const externs = [ 
          <div className="Tool" key="kaiLink"><a href="https://kai.kodachi.se/kai">Besök Kodachikai!</a></div>,
          <div className="Tool" key="schemaLink"><a href="https://schema.kodachi.se">Schema för Kodachicon!</a></div>
    ];
      var taskbox = tcount>0?<div className="Toolbox"><label for="c1">Pågående uppgifter</label><input type="checkbox" id="c1" defaultChecked="true" /><div>{tasks}</div></div>:null;
      var listbox = lcount>0?<div className="Toolbox"><label for="c2">Sidor</label><input type="checkbox" id="c2" defaultChecked="true" /><div>{lists}</div></div>:null;
      var toolbox = tools.length>0?<div className="Toolbox"><label for="c3">Verktyg</label><input type="checkbox" defaultChecked="true" id="c3" /><div>{tools}</div></div>:null;
      var extern = externs.length>0?<div className="Toolbox"><label for="c4">Externt</label><input type="checkbox" defaultChecked="true" id="c4" /><div>{externs}</div></div>:null;
      var articles = q.length>0?<div key="pagesWrapper" className="Toolbox"><label for="c5">Artiklar</label><input type="checkbox" id="c5" defaultChecked="true" /><div>{q}</div></div>:null;

    return (<div>{taskbox}{articles}{listbox}{toolbox}{extern}</div>);
  }
}

const ToolboxContainer = connect(
        state => {
            return {tools: state.app.session.tools?state.app.session.tools:[], tasks: state.app.session.tasks?state.app.session.tasks:[], lists: state.app.session.lists?state.app.session.lists:[], books: state.app.session.books?state.app.session.books:[]};
        },
        dispatch => {
            return {};
        }
        )(Toolbox);
export default ToolboxContainer;
