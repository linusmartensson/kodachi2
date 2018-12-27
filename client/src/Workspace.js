
import 'babel-polyfill'

import React, { Component } from 'react';
import Surface from './Surface'
import Drawer from './Drawer'

import {Route, Redirect} from 'react-router-dom';

import {Provider} from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-promise';

import history from './history'

import {createStore, applyMiddleware} from 'redux';
import {actions, reducer} from './reducers/root.js'

import TaskPopup from './TaskPopup';
import Loader from './Loader';

import './Workspace.css'
import './Print.css'
import {connect} from 'react-redux'
import InfoPopup from './InfoPopup';
import {routerMiddleware, ConnectedRouter} from 'connected-react-router'

const store = createStore(reducer(history), applyMiddleware(store => next => action => {
    var isfun = (obj) => {
        return typeof obj === 'function';
    };
    return next(isfun(action.payload)?action.payload:action);
},thunkMiddleware, promiseMiddleware, routerMiddleware(history)));
require('es6-promise').polyfill()

store.dispatch(actions.app.server.start());


class Workspace extends Component {
    render() {

        var backgroundConfig = {"backgroundImage":"url('/img/bg2019.png')"};
        var headerImage = "/img/kodachicon_new.png";


        return (
                <Provider store={store}><div className="Root">
                    <Loader/>
                    <ConnectedRouter history={history}>
                        <div className="Workspace" style={backgroundConfig}>
                            <Drawer/>
                            <div className="Workspace-inner">
                                <div className="Workspace-head"><img src={headerImage} alt=""/></div>
                                <Route path="/:type/:path" component={SurfaceRoute}/>
                                <Route exact path="/" component={Redir} />
                            </div>
                            <InfoPopup />
                        </div>
                    </ConnectedRouter>
                </div></Provider>
               )
    }
}

var Redir = (props) => {

   if(props.location.pathname==="/"){
       return <Redirect to="/book/kodachicon2018" />
    
   }
   return null;
}

var SurfaceRouteBase = (props) => {

    var matches = [];
    var match = props.match;
    var id = "";

    switch(match.params.type){
        case 'book':
            const books = props.books || [];
            matches = books.filter(b => (b.path === match.params.path));
            id = match.params.path.split(".")[0];
            if(matches.length > 0) matches = matches[0].content; else matches = false;
            break;
        case 'list':
            const lists = props.lists || [];
            if(lists[match.params.path]) {
                matches = lists[match.params.path].content; 
            
                id = match.params.path.split(".")[0];
            }else{
                matches = false;
                setTimeout(()=>{props.tryFetch(match.params.path)},0);
            }
            break;
        case 'profile':
            matches = props.profile ? props.profile.content : false;
            break;
        case 'task':
            return <TaskPopup task={match.params.path} /> 
        default:
            matches = false;
    }


    if(matches)
        return <Surface id={id} pages={matches} />;
    else
        return null;
}

const SurfaceRoute = connect(
    state => {
        return {
        books:state.app.session.books,
        lists:state.app.lists,
        profile:state.app.session.profile
    }},
    dispatch => {return {
        tryFetch: (q) => {dispatch(actions.app.list.show(q))}
    }},
)(SurfaceRouteBase);

export default Workspace;

