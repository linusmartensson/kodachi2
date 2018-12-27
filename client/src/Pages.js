

import React, { Component } from 'react';
import './Pages.css'
import StoredPage from './StoredPage'
import {connect} from 'react-redux'

class Pages extends Component {
  render() {

    var books = {};
    var bp = this.props.books;
    
    for(var v of bp){
        if(!books[v.group]) books[v.group] = [];

        books[v.group].push(v);
    }
    var q = [];
    for(var b in books){
        var bs = books[b];
        var group = bs[0].group;
        var storedPages = bs.map((book) => <StoredPage key={book.id} name={book.title} path={"/book/"+book.path} />);
        q.push({group, storedPages});
    }

    q = q.map(v => <div key={v.group} className="Pages">{v.storedPages}</div>);
    return q.length>0?<div key="pagesWrapper" className="PagesWrapper">{q}</div>:null;
  }
}

const PagesContainer = connect(
        state => {
            return {books: state.app.session.books?state.app.session.books:[]};
        },
        dispatch => {
            return {}
        })(Pages);
export default PagesContainer;
