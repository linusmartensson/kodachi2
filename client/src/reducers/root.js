//import {combineReducers} from 'redux';  

import {createActions, handleActions} from 'redux-actions'
import {combineReducers} from 'redux'
import reduceReducers from 'reduce-reducers'
import { connectRouter, push } from 'connected-react-router'
import fetch from 'isomorphic-fetch'
//import io from 'socket.io-client';
var _ = require('lodash');

/*var patcher = require('jsondiffpatch').create({
    objectHash: (obj) => {
        return obj.id || obj._id;
    }
});*/
var host = 'https://'+window.location.hostname+':3001/';

var initialState = {session:{}, ui:{selectors:{}, editors:{}}, currentTask:{}, lists:{}};


export const actions = createActions({
    APP: {
        REFRESH: ()=>({}),
        SERVER: {
            /*UPDATE: diff => ({ diff }),*/
            STATE: state => ({ state }),
            START: () => {
                return async dispatch => {
                    fetch(host+'state', {credentials:'include'})
                        .then(r=>{return r.json()})
                        .then(data=>{
                            dispatch(actions.app.server.state(data))
                        });
                    /*fetch(host+'session', {credentials:'include'})
                        .then(r=>{return r.text()})
                        .then(t=>{
                            var sio = io(host+"?token="+t);
                            sio.on('state', (data) => {
                                dispatch(actions.app.server.state(data));
                            });
                            sio.on('update', (data) => {
                                dispatch(actions.app.server.update(data));
                            });
                        });*/
                }
            }
        },
        LIST: {
            SHOW: (list) => {
                return dispatch => {
                    dispatch(actions.app.list.start.request(list));
                    fetch(host+'data/'+list,{credentials:'include'})
                        .then(r=>{return r.json()})
                        .then(r=>{
                        dispatch(actions.app.list.load(list, r));
                        dispatch(push('/list/'+list));
                    });
                }
            },
            LOAD: (list, data) => ({list, data}),
            START: {
                REQUEST: (list) => ({list})
            }
        },
        TASK: {
            ERROR:{
                SHOW: (error)=>({error}),
                HIDE: ()=>({})
            },
            START:{
                REQUEST: () => {
                    return {};
                },
                SUCCESS: () => ({}),
                FAILURE: () => ({}),
                DO: (task, data) => {
                    return dispatch => {
                        dispatch(actions.app.task.start.request());
                        fetch(host+'task/start_task/'+task,
                            {credentials:'include', method:'POST', body:new URLSearchParams(data)}).then(r=>{return r.json()}).then((data)=>{
                                dispatch(actions.app.server.state(data.state));
                                dispatch(actions.app.task.start.success())   
                                dispatch(push('/task/'+data.response));
                            });
                    }
                }
            },
            RESPOND:{
                REQUEST: () => ({}),
                SUCCESS: () => ({}),
                FAILURE: () => ({}),
                DO: (task, form) => {
                    return dispatch => {
                        var q = setTimeout(()=>{dispatch(actions.app.task.respond.request())},200);
                        fetch(host+'task/respond_task/'+task.id,
                            {credentials:'include', method:'POST', body:form}).then(r=>{return r.json()}).then((data)=>{
                                clearTimeout(q);
                                if(data.response.result !== 'OK'){
                                    if(data.response.message) 
                                        dispatch(actions.app.task.error.show(data.response.message));
                                    setTimeout(()=>{dispatch(actions.app.task.error.hide())}, 10000);
                                }
                                dispatch(actions.app.server.state(data.state));
                                dispatch(actions.app.task.respond.success());
                                
                                if(data.response.id)
                                    dispatch(push('/task/'+data.response.id));
                            });
                    }
                }
            }
        },
        UI: {
            SELECTOR:{
                UPDATE: (elem, pos) => ({elem, pos})
            },
            EDITOR:{
                UPDATE: (elem, content) => ({elem, content})
            }
        }

    }
});

export const appReducer = handleActions({
    APP: {
        REFRESH: (state)=>({...state}),
        SERVER: {
            /*UPDATE: (state, action) => {
                let v = _.cloneDeep(state);  
                patcher.patch(v.session, action.payload.diff)
                
                //Close any old or deleted currentTask
                let found = false;
                if(v.currentTask && v.currentTask.task) for(let m of v.session.tasks) {
                    if(m.result === 'WAIT_RESPONSE' && m.id === v.currentTask.task.id){
                        found = true;
                        break;
                    }
                }
                if(!found){
                    v.currentTask = undefined;
                }
                
                for(let m of v.session.tasks){
                    //Open any updated task
                    if(m.result === 'WAIT_RESPONSE' && m.updated){
                        let w = _.cloneDeep(m);
                        return {...v, currentTask:{task:w}};
                    }
                }
                
                return v;
            },*/
            STATE: (state, action) => {
                let v = _.cloneDeep(state);
                v.session = action.payload.state;

                //Close any old or deleted currentTask
                let found = false;
                if(v.currentTask && v.currentTask.task) for(let m of v.session.tasks) {
                    if(m.result === 'WAIT_RESPONSE' && m.id === v.currentTask.task.id){
                        found = true;
                        break;
                    }
                }
                if(!found){
                    v.currentTask = undefined;
                }
                
                for(let m of v.session.tasks){
                    //Open any updated task
                    if(m.result === 'WAIT_RESPONSE' && m.updated){
                        let w = _.cloneDeep(m);
                        return {...v, currentTask:{task:w}};
                    }
                }

                return v;
            }
        },
        LIST: {
            SHOW: (state, action) => {return state;},
            LOAD: (state, action) => {
                var l = _.cloneDeep(state.lists);
                if(action.payload.data)
                    l[action.payload.list] = action.payload.data;
                return {...state, lists:l, isFetching:false};
            },
            START:{
                REQUEST: (state, action) => {
                    var v = {...state, isFetching:true};
                    v.lists = _.cloneDeep(state.lists);
                    v.lists[action.payload.list] = {content:false};
                    return v;
                }
            }
        },
        TASK: {
            ERROR:{
                SHOW: (state,action)=>{
                    return {...state, currentMessage:action.payload.error};
                },
                HIDE: (state,action)=>{
                    return {...state, currentMessage:undefined};
                }
            },
            START:{
                REQUEST: (state, action) => ({...state, isFetching:true}),
                SUCCESS: (state, action) => ({...state, isFetching:false}),
                FAILURE: (state, action) => ({...state, isFetching:false}),
            },
            RESPOND:{
                REQUEST: (state, action) => ({...state, isFetching:true}),
                SUCCESS: (state, action) => ({...state, isFetching:false}),
                FAILURE: (state, action) => ({...state, isFetching:false}),
                DO: (state, action) => ({...state})
            }
        },
        UI: {
            SELECTOR:{
                UPDATE: (state, action) => {
                    var v = _.cloneDeep(state);
                    v.ui.selectors[action.payload.elem] = action.payload.pos;
                    return v;
                }
            },
            EDITOR:{
                UPDATE: (state, action) => {
                    var v = _.cloneDeep(state);
                    v.ui.editors[action.payload.elem] = action.payload.content;
                    return v;
                }
            }
        }
    }
}, initialState);

export const reducer = (history) => combineReducers({app:appReducer, router:connectRouter(history)})
