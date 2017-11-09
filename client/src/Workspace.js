
import 'babel-polyfill'
import {connect} from 'react-redux'

import React, { Component } from 'react';
import Surface from './Surface'
import Drawer from './Drawer'

import {BrowserRouter as Router, Route} from 'react-router-dom';

import {Provider} from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-promise';


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
                <Provider store={store}><div>
                    <Loader/>
                    <Router>
                        <div className="Workspace" style={backgroundConfig}>
                            <Drawer/>
                            <div className="Workspace-head"><img src={headerImage} alt=""/></div>
                            <Route path="/:path" component={SurfaceRoute}/>
                            <TaskPopup />
                        </div>
                    </Router>
                </div></Provider>
               )
    }
}


const SurfaceRoute = ({match}) => {
    const books = store.getState().session.books || [];
    const matches = books.filter(b => (b.path === match.params.path));

    if(matches.length > 0)
        return <Surface pages={matches[0].content} />;
    else
        return null;
};

export default Workspace;

