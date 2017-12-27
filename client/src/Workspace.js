
import 'babel-polyfill'

import React, { Component } from 'react';
import Surface from './Surface'
import Drawer from './Drawer'

import {BrowserRouter as Router, Route} from 'react-router-dom';

import {Provider} from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-promise';

import history from './history'

import {createStore, applyMiddleware} from 'redux';
import {actions, reducer} from './reducers/root.js'

import TaskPopup from './TaskPopup';
import Loader from './Loader';

import './Workspace.css'

const store = createStore(reducer, applyMiddleware(store => next => action => {
    var isfun = (obj) => {
        return typeof obj === 'function';
    };
    return next(isfun(action.payload)?action.payload:action);
},thunkMiddleware, promiseMiddleware));
require('es6-promise').polyfill()

store.dispatch(actions.app.server.start());


class Workspace extends Component {
    render() {

        var backgroundConfig = {"backgroundImage":"url('/img/bg2018.png')"};
        var headerImage = "/img/kodachicon_new.png";


        return (
                <Provider store={store}><div className="Root">
                    <Loader/>
                    <Router history={history}>
                        <div className="Workspace" style={backgroundConfig}>
                            <Drawer/>
                            <div className="Workspace-inner">
                                <div className="Workspace-head"><img src={headerImage} alt=""/></div>
                                <Route path="/:type/:path" component={SurfaceRoute}/>
                            </div>
                            <TaskPopup />
                        </div>
                    </Router>
                </div></Provider>
               )
    }
}


const SurfaceRoute = ({match}) => {

    var matches = [];
    
    switch(match.params.type){
        case 'book':
            const books = store.getState().session.books || [];
            matches = books.filter(b => (b.path === match.params.path));
            if(matches.length > 0) matches = matches[0].content; else matches = false;
            break;
        case 'list':
            const lists = store.getState().lists || [];
            if(lists[match.params.path]) matches = lists[match.params.path].content; else matches = false;
            console.dir(matches);
            break;
    }

    if(matches)
        return <Surface pages={matches} />;
    else
        return null;
};

export default Workspace;

