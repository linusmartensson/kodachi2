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
var host = 'https://localhost:3001/';

var initialState = {session:{}};


export const actions = createActions({
    APP: {
        SERVER: {
            UPDATE: diff => ({ diff }),
            STATE: state => ({ state }),
            START: () => {
                return async dispatch => {
                    fetch(host+'session', {credentials:'include'})
                        .then(r=>{return r.text()})
                        .then(t=>{
                            var sio = io("https://localhost:3001/?token="+t);
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
        TASK: {
            START:{
                REQUEST: () => {
                    return {};
                },
                SUCCESS: () => ({}),
                FAILURE: () => ({}),
                DO: (task, form) => {
                    return dispatch => {
                        dispatch(actions.app.task.start.request());
                        fetch(host+'task/start_task/'+task,{credentials:'include'}).then(()=>{
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
                        dispatch(actions.app.task.close());
                        dispatch(actions.app.task.respond.request());
                        fetch(host+'task/respond_task/'+task.id,
                            {credentials:'include', method:'POST', body:form}).then(()=>{
                                dispatch(actions.app.task.respond.success());
                            });
                    }
                }
            },
            SHOW: (id) => ({id}),
            CLOSE: () => ({}),
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
        SERVER: {
            UPDATE: (state, action) => {
                var v = _.cloneDeep(state);  
                patcher.patch(v.session, action.payload.diff)
                if(v.session.tasks.length > state.session.tasks.length){
                    for(var m of v.session.tasks){
                        if(m.result === 'WAIT_RESPONSE'){
                            var w = _.cloneDeep(m);
                            return {...v, currentTask:{task:w}};
                        }
                    }
                }
                return v;
            },
            STATE: (state, action) => {
                return {...state, session:action.payload.state};
            }
        },
        TASK: {
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
                ...state, currentTask:undefined
            })

        }
    }
}, initialState);

