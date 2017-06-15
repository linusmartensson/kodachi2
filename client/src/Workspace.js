
import React, { Component } from 'react';
import Surface from './Surface'
import Drawer from './Drawer'

import { 
    BrowserRouter as Router,
    Route
} from 'react-router-dom';

import {Provider} from 'react-redux';
import thunk from 'redux-thunk';

import {createStore, applyMiddleware} from 'redux';
import rootReducer from './reducers/root.js'

import './Workspace.css'

const store = createStore(rootReducer, applyMiddleware(thunk));

const drawer = {
    tools:[
        {task:'LOGIN', title:'Log in'},
        {task:'CREATE_EVENT', title:'Create an event'}
    ],
    
    books:[
        {path:'/my-test-book', title:'My test book', id:0},
        {path:'/test2', title:'What to do', id:1},
        {path:'/book', title:'When the toll calls', id:2},
        {path:'/hello', title:'And the tide rolls in', id:3}
    ]
};

const profile = {nickname:'Lolpants'};

const test_book = {path:'my-test-book', title:'My test book', content:[
    {id:0, tiers:[
        {
            id:0, 
            panels:[
            {id:0,content:[
                {id:0, type:'caption', text:"Hallå där!"},
                {id:11, type:'speechbubble', position:'left', text:"Mwahaa! Det blir bättre med mer text!", image:"/img/kodachi_lores2.png"},
                {id:111, type:'speechbubble', position:'right', text:"Mwahaa!", image:"/img/kodachi_lores2.png"},
                {id:2, type:'text', text:"Lorem ipsum dolor sit amet"},
                {id:3, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men. woop nu kör vi!"},
                {id:30, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men. woop nu kör vi!"},
                {id:31, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men. woop nu kör vi!"},
                {id:22, type:'clear'},
                {id:4, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop nu kör vi!"},

                {id:5, type:'caption', text:"Hallå där!"},
                {id:8, type:'speechbubble', position:'left', text:"Woop! Om det bara fanns glass så hade jag varit lycklig!", image:"/img/kodachi_lores2.png"},
                {id:6, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men wo--op nu kör vi!"},
                {id:7, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop nu kör vi!"},
                {id:9, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop nu kör vi!"},
                {id:10, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop--- nu kör vi!"},
            ],width:32,border:true}


            ]
        },
        {
            id:2,
            panels:[{id:0, border:false, content:[{id:0, type:'speechbubble', image:'/img/kodachi_lores2.png', text:'Hey there! Jag hoppar bara in här i mitten och tar en massa plats!'}]}]
        },
        {
            id:1,
            panels:[
            {id:1,content:[
                {id:0, type:'caption', text:"Hallå där!"},
                {id:2, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop nu kör vi!"},
                {id:3, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men. woop nu kör vi!"},
                {id:4, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop nu kör vi!"},
                {id:5, type:'caption', text:"Hallå där!"},
                {id:6, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men wo--op nu kör vi!"},
                {id:7, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop nu kör vi!"},
                {id:9, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop nu kör vi!"},
                {id:10, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop--- nu kör vi!"},
            ],width:62,border:true}
            ,{id:2,content:[
                {id:0, type:'caption', text:"Hallå där!"},
                {id:2, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop nu kör vi!"},
                {id:3, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men. woop nu kör vi!"},
                {id:4, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop nu kör vi!"},
                {id:5, type:'caption', text:"Hallå där!"},
                {id:6, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men wo--op nu kör vi!"},
                {id:7, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop nu kör vi!"},
                {id:8, type:'speechbubble', position:'right', text:"Woop! Om det bara fanns glass så hade jag varit lycklig!", image:"/img/kodachi_lores2.png"},
                {id:9, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop nu kör vi!"},
                {id:10, type:'text', text:"Nu är det dags för version 2.0 av Kodachicon! Jag har ingen aning om hur det här kommer att sluta, men woop--- nu kör vi!"},
            ],width:62,border:true}
            ]
        }
        ]}
    ]};

const books = [test_book];

class Workspace extends Component {
    render() {

        var backgroundConfig = {"backgroundImage":"url('/img/bg2017.png')"};
        var headerImage = "/img/kodachicon_new.png";


        return (
                <Provider store={store}><Router><div className="Workspace" style={backgroundConfig}>
                    <Drawer profile={profile} books={drawer.books} tools={drawer.tools} />
                    <div className="Workspace-head"><img src={headerImage} alt=""/></div>
                    <Route path="/:path" component={SurfaceRoute}/>
                </div></Router></Provider>
               )
    }
}

const SurfaceRoute = ({match}) => {
    const matches = books.filter(b => (b.path === match.params.path));

    if(matches.length > 0)
        return <Surface pages={matches[0].content} />;
    else
        return null;
};

export default Workspace;

