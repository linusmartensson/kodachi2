import {combineReducers} from 'redux';  
import actions from '../actions.js'
var patcher = require('jsondiffpatch').create({
    objectHash: (obj) => {
        return obj.id || obj._id;
    }
});


var initialState = {session:{}};


const rootReducer = (state = initialState, action) => {

    switch(action.type){
        case actions.SERVER_UPDATE:
           return Object.assign({}, state, {session:patcher.patch(state.session, action.diff)});  
        case actions.SERVER_STATE:
           return Object.assign({}, state, {session:action.state});
        default:
           return state;
    }

};

export default rootReducer;  
