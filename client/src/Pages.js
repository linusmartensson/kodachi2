

import React, { Component } from 'react';
import './Pages.css'
import StoredPage from './StoredPage'
import {connect} from 'react-redux'

class Pages extends Component {
  render() {
    const books = this.props.books.map((book) => <StoredPage key={book.id} name={book.title} path={book.path} />);
    return (<div className="Pages">{books}</div>);
  }
}

const PagesContainer = connect(
        state => {
            return {books: state.session.books?state.session.books:[]};
        },
        dispatch => {

        })(Pages);
export default PagesContainer;
