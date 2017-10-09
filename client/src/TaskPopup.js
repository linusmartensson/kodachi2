
import React, { Component } from 'react';
import Page from './Page';
import './TaskPopup.css'

import {connect} from 'react-redux'

import {actions} from './reducers/root.js'

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
            console.dir(this.props.task.task);
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
        return (<div className="TaskPopup"><form ref={this.setFormRef} onSubmit={this.handleSubmit}>
                <div className="TaskPopup-item" ref={this.setWrapperRef}>
                    <Page key={this.props.id} tiers={this.props.tiers} />
                </div></form>
            </div>);
    }
}

const TaskPopupContainer = connect(
        state => {
            var hasTask = !!state.currentTask && !!state.currentTask.task;
            console.dir(state.currentTask);
            return {
                hasTask:hasTask,
                task:hasTask?state.currentTask.task:null,
                id:hasTask?state.currentTask.task.id:0,
                tiers:hasTask?state.currentTask.tiers:[]
            }
        },
        dispatch => {
            return {
                close:() => {
                    dispatch(actions.app.task.close())
                },
                submit:(task, node, cancel) => {
                    var q = new FormData();
                    for(var v of node.elements) {
                        if(v.files && v.files.length > 0) {
                            q.append(v.name, v.files[0], v.value);
                        } else {
                            q.append(v.name, v.value);
                        }
                    }
                    if(cancel) q.append('cancel', true);
                    dispatch(actions.app.task.submit(task, q))
                }
            }
        }
        )(TaskPopup);

export default TaskPopupContainer;
