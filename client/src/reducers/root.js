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
                                if(data.tasks){
                                    if(data.tasks[0][0]){
                                        dispatch(actions.app.task.show(data.tasks[0][0]));
                                    }   
                                }
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
                DO: (task) => {
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
                DO: () => ({})
            },
            SHOW: (task) => ({task}),
            CLOSE: () => ({})
        }
    }
});

export const reducer = handleActions({
    APP: {
        SERVER: {
            UPDATE: (state, action) => {
                var v = _.cloneDeep(state);  
                patcher.patch(v.session, action.payload.diff)
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
                DO: (state, action) => {
                    return {...state}
                }
            },
            RESPOND:{
                REQUEST: (state, action) => ({...state, isFetching:true}),
                SUCCESS: (state, action) => ({...state, isFetching:false}),
                FAILURE: (state, action) => ({...state, isFetching:false}),
                DO: (state, action) => ({...state})
            },
            SHOW: (state, action) => ({
                ...state, currentTask: {id:state.session.tasks[action.payload.id], tiers:state.session.books[0].content[0].tiers},
            }),
            CLOSE: (state, action) => ({
                ...state, currentTask:undefined
            })

        }
    }
}, initialState);

