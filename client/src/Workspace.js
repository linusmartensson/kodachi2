
import React, { Component } from 'react';
import Surface from './Surface'
import Drawer from './Drawer'

import { 
    BrowserRouter as Router,
    Route
} from 'react-router-dom';

import {Provider} from 'react-redux';
import thunk from 'redux-thunk';

import io from 'socket.io-client';

import {createStore, applyMiddleware} from 'redux';
import rootReducer from './reducers/root.js'

import './Workspace.css'
import actions from './actions.js'

const store = createStore(rootReducer, applyMiddleware(thunk));

var sio = io("https://localhost:3001/?token=123")

sio.on('state', (data) => {
    console.dir(data);
    store.dispatch(actions.serverState(data));
});
sio.on('update', (data) => {
    store.dispatch(actions.serverUpdate(data));
});

const profile = {nickname:'Lolpants'};
class Workspace extends Component {
    render() {

        var backgroundConfig = {"backgroundImage":"url('/img/bg2017.png')"};
        var headerImage = "/img/kodachicon_new.png";


        return (
                <Provider store={store}>
                    <Router>
                        <div className="Workspace" style={backgroundConfig}>
                            <Drawer/>
                            <div className="Workspace-head"><img src={headerImage} alt=""/></div>
                            <Route path="/:path" component={SurfaceRoute}/>
                        </div>
                    </Router>
                </Provider>
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

