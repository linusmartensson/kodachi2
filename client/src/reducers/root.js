//import {combineReducers} from 'redux';  

import {createActions, handleActions} from 'redux-actions'
import fetch from 'isomorphic-fetch'
import io from 'socket.io-client';
var _ = require('lodash');

var patcher = require('jsondiffpatch').create({
    objectHash: (obj) => {
        return obj.id || obj._id;
    }
});
var host = 'https://'+window.location.hostname+':3001/';

var initialState = {session:{}, ui:{selectors:{}, editors:{}}, currentTask:{}, lists:{}};


export const actions = createActions({
    APP: {
        REFRESH: ()=>({}),
        SERVER: {
            UPDATE: diff => ({ diff }),
            STATE: state => ({ state }),
            START: () => {
                return async dispatch => {
                    fetch(host+'session', {credentials:'include'})
                        .then(r=>{return r.text()})
                        .then(t=>{
                            var sio = io(host+"?token="+t);
                            sio.on('state', (data) => {
                                dispatch(actions.app.server.state(data));
                            });
                            sio.on('update', (data) => {
                                dispatch(actions.app.server.update(data));
                            });
                        });
                }
            }
        },
        LIST: {
            SHOW: (list, history) => {
                return dispatch => {
                    dispatch(actions.app.list.start.request(list));
                    fetch(host+'data/'+list,{credentials:'include'})
                        .then(r=>{return r.json()})
                        .then(r=>{
                        dispatch(actions.app.list.load(list, r));
                        history.push('/list/'+list);
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
                            {credentials:'include', method:'POST', body:new URLSearchParams(data)}).then(()=>{
                                dispatch(actions.app.task.start.success())   
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
                            {credentials:'include', method:'POST', body:form}).then(r=>{return r.text()}).then((data)=>{
                                clearTimeout(q);
                                if(data !== 'OK'){
                                    dispatch(actions.app.task.error.show(data));
                                    setTimeout(()=>{dispatch(actions.app.task.error.hide())}, 10000);
                                }
                                dispatch(actions.app.task.respond.success());
                            });
                    }
                }
            },
            SHOW: (id) => ({id}),
            CLOSE: () => ({}),
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

function getTask(state, id){
    for(let i of state.session.tasks){
        if(i.id === id) return i;
    }
    return undefined;
}

export const reducer = handleActions({
    APP: {
        REFRESH: (state)=>({...state}),
        SERVER: {
            UPDATE: (state, action) => {
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
            },
            STATE: (state, action) => {
                return {...state, session:action.payload.state};
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
            },
            SHOW: (state, action) => {
                var v = _.cloneDeep({task:getTask(state, action.payload.id)});
                return {...state, currentTask: v}
            },
            CLOSE: (state, action) => ({
                ...state, currentTask:undefined, ui:{editors:[], selectors:[]}
            })
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

