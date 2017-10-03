//import {combineReducers} from 'redux';  

import {createActions, handleActions} from 'redux-actions'
import fetch from 'isomorphic-fetch'
import io from 'socket.io-client';

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
                                console.dir("HEEEY, I'm getting state over here!");
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
                DO: (task) => {
                    console.trace();
                    return dispatch => {
                        console.dir("hello?");
                        dispatch(actions.app.task.start.request());
                        fetch(host+'task/start_task/'+task,{credentials:'include'}).then(console.dir).then(()=>{
                            console.dir("ya!");
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
                return Object.assign({}, state, {session:patcher.patch(state.session, action.payload.diff)});  
            },
            STATE: (state, action) => {
                return Object.assign({}, state, {session:action.payload.state});
            }
        },
        TASK: {
            START:{
                REQUEST: (state, action) => ({...state, isFetching:true}),
                SUCCESS: (state, action) => ({...state, isFetching:false}),
                FAILURE: (state, action) => ({...state, isFetching:false}),
                DO: (state, action) => {
                    console.dir(action);
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

