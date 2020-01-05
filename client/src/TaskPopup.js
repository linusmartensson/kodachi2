
import React, { Component } from 'react';

import {connect} from 'react-redux'

import {actions} from './reducers/root.js'
import Surface from './Surface';

var _ = require('lodash');

class TaskPopup extends Component{

    constructor(props) {
        super(props);
        this.setWrapperRef = this.setWrapperRef.bind(this);
        this.setFormRef = this.setFormRef.bind(this);
        this.setInnerRef = this.setInnerRef.bind(this);
        //this.handleClickOutside = this.handleClickOutside.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    setWrapperRef(node){
        this.wrapperRef = node;
    }
    setFormRef(node){
        this.formRef = node;
    }
    setInnerRef(node){
        this.innerRef = node;
    }

    componentDidUpdate(prevProps) {
        if(this.props.task != prevProps.task)
            window.scrollTo(0, 0)
    }

    componentDidMount() {
        //document.addEventListener('mousedown', this.handleClickOutside);
        window.scrollTo(0, 0)
    }

    componentWillUnmount() {
        //document.removeEventListener('mousedown', this.handleClickOutside);
    }
    /*handleClickOutside(event) {
        if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
            if(this.innerRef && event.clientX > this.innerRef.getBoundingClientRect().right) return;
            var t = this.props.task.type.inputs; 
            for(var i of t){
                if(i.autocancel){
                    this.props.submit(this.props.task, this.props.tasks, this.formRef, true);
                    return;
                }
            }
            this.props.close();
        }
    }*/
    handleSubmit(event){
        event.preventDefault();
        this.props.submit(this.props.task, this.props.tasks, this.formRef, false);
    }

    render(){
        let hasTask = false;
        let task = null;
        if(this.props.tasks === undefined) return null;

        for(let v of this.props.tasks){
            if(v.id === this.props.task && v.result == 'WAIT_RESPONSE'){
                hasTask = true;
                task = v;
            }
        }

        if(!hasTask){
            return null;
        }
        var pages = [];
        pages = pages.concat(_.cloneDeep(task.description));
        for(var v of task.type.inputs){

            if(v.redirect) window.location = v.redirect;
           
            if(!v.field) continue; 
            if(v.type === 'button') continue;
            pages = pages.concat(_.cloneDeep(v.desc));
            if(pages.length === 0) pages = [{id:0, tiers:[]}]

            pages[pages.length-1].tiers = pages[pages.length-1].tiers.concat([
                {id:v.field, panels:[
                    {id:0, border:false, width:1, content:[
                        v.name.length>0?{
                            id:0,
                            error:task.error_field==v.field,
                            type:'caption',
                            text:v.name,
                        }:{},
                        {   
                            id:v.field,
                            error:task.error_field==v.field,
                            type:"input_"+v.type,
                            content:v,
                            text:task.data[v.field]?task.data[v.field]:task.data.start_data[v.field]?task.data.start_data[v.field]:undefined
                        }
                    ]}
                ]}
            ]);
        }

        var buttons = {id:'_buttons', panels:[]};
        for(var vv of task.type.inputs){
            if(!vv.field || vv.type !== 'button') continue;
            buttons.panels.push({
                id:vv.field,
                border:true, width:1, content:[
                    {id:vv.field, type:'button', text:vv.name}
                ]
            });
        }
        if(buttons.panels.length > 0) pages.push({id:"_buttons", tiers:[buttons]});
        return (<form ref={this.setFormRef} onSubmit={this.handleSubmit}>
                    <Surface key={this.props.task} pages={pages} />
                </form>
            );
    }
}

const TaskPopupContainer = connect(
        state => {

            return {
                tasks:state.app.session.tasks,
            }
        },
        dispatch => {
            return {
                close:() => {
                    dispatch(actions.app.task.close())
                },
                submit:(task, tasks, node, cancel) => {
                    let hasTask = false;
                    if(tasks === undefined) return;
                    for(let v of tasks){
                        if(v.id === task){
                            hasTask = true;
                            task = v;
                        }
                    }
                    if(!hasTask) return;
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
                                    for(var w of vv.selectedOptions){
                                        opts.push(w.value);
                                    }
                                    q.append(vv.name, JSON.stringify(opts));
                                } else if(vv.type === 'checkbox') {
                                    q.append(vv.name, vv.checked);
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
