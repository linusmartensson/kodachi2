
import React, { Component } from 'react';
import './TaskPopup.css'

import {connect} from 'react-redux'

import {actions} from './reducers/root.js'
import Surface from './Surface';

var _ = require('lodash');

class TaskPopup extends Component{

    constructor(props) {
        super(props);
        this.setWrapperRef = this.setWrapperRef.bind(this);
        this.setFormRef = this.setFormRef.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    setWrapperRef(node){
        this.wrapperRef = node;
    }
    setFormRef(node){
        this.formRef = node;
    }


    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }
    handleClickOutside(event) {
        if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
            var t = this.props.task.type.inputs; 
            for(var i of t){
                if(i.autocancel){
                    this.props.submit(this.props.task, this.formRef, true);
                    return;
                }
            }
            this.props.close();
        }
    }
    handleSubmit(event){
        this.props.submit(this.props.task, this.formRef, false);
    }

    render(){
        if(!this.props.hasTask){
            return null;
        }
        var pages = [];
        pages = pages.concat(_.cloneDeep(this.props.task.description));
        for(var v of this.props.task.type.inputs){
           
            if(!v.field) continue; 
            if(v.type === 'button') continue;
            pages = pages.concat(_.cloneDeep(v.desc));
            if(pages.length === 0) pages = [{id:0, tiers:[]}]

            pages[pages.length-1].tiers = pages[pages.length-1].tiers.concat([
                {id:v.field, panels:[
                    {id:0, border:true, width:1, content:[
                        v.name.length>0?{
                            id:0,
                            type:'caption',
                            text:v.name
                        }:{},
                        {   
                            id:v.field,
                            type:"input_"+v.type,
                            content:v
                        }
                    ]}
                ]}
            ]);
        }

        var buttons = {id:'_buttons', panels:[]};
        for(var vv of this.props.task.type.inputs){
            if(!vv.field || vv.type !== 'button') continue;
            buttons.panels.push({
                id:vv.field,
                border:true, width:1, content:[
                    {id:vv.field, type:'button', text:vv.name}
                ]
            });
        }
        if(buttons.panels.length > 0) pages.push({id:"_buttons", tiers:[buttons]});
        return (<div className="TaskPopup"><form ref={this.setFormRef} onSubmit={this.handleSubmit}>
                <div className="TaskPopup-item" ref={this.setWrapperRef}>
                    <Surface key={this.props.id} pages={pages} />
                </div></form>
            </div>);
    }
}

const TaskPopupContainer = connect(
        state => {
            var hasTask = !!state.currentTask && !!state.currentTask.task;
            return {
                hasTask:hasTask,
                task:hasTask?state.currentTask.task:null,
                id:hasTask?state.currentTask.task.id:0,
            }
        },
        dispatch => {
            return {
                close:() => {
                    dispatch(actions.app.task.close())
                },
                submit:(task, node, cancel) => {
                    var q = new FormData();
                    var i = {};
                    for(var v of task.type.inputs){
                        if(v.field && v.type==='button'){
                            i[v.field] = true;
                        }
                    }
                    if(cancel) q.append('cancel', true);
                    else for(var vv of node.elements) {
                        if(vv.files && vv.files.length > 0) {
                            q.append(vv.name, vv.files[0], vv.value);
                        } else {
                            if(i[vv.name] ){
                                q.append(vv.name, vv.clicked);
                            } else {
                                if(vv.selectedOptions){
                                    var opts = [];
                                    for(var v of vv.selectedOptions){
                                        opts.push(v.value);
                                    }
                                    q.append(vv.name, JSON.stringify(opts));
                                } else {
                                    q.append(vv.name, vv.value);
                                }
                            }
                        }
                    }
                    dispatch(actions.app.task.respond.do(task, q))
                }
            }
        }
        )(TaskPopup);

export default TaskPopupContainer;
