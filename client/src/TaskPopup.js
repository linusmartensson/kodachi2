
import React, { Component } from 'react';
import Page from './Page';
import './TaskPopup.css'

import {connect} from 'react-redux'

import {actions} from './reducers/root.js'

class TaskPopup extends Component{

    constructor(props) {
        super(props);
        this.setWrapperRef = this.setWrapperRef.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
    }

    setWrapperRef(node){
        this.wrapperRef = node;
    }


    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }
    handleClickOutside(event) {
        if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
            this.props.cancel();
        }
    }

    render(){
        if(!this.props.hasTask){
            return null;
        }
        return (<div className="TaskPopup">
                <div className="TaskPopup-item" ref={this.setWrapperRef}>
                    <Page key={this.props.id} tiers={this.props.tiers} />
                </div>
            </div>);
    }
}

const TaskPopupContainer = connect(
        state => {
            var hasTask = !!state.currentTask;
            return {
                hasTask:hasTask,
                id:hasTask?state.currentTask.id:0,
                tiers:hasTask?state.currentTask.tiers:[]
            }
        },
        dispatch => {
            return {cancel:() => {
                dispatch(actions.app.task.close())
            }}
        }
        )(TaskPopup);

export default TaskPopupContainer;
