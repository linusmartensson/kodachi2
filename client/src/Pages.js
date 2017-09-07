

import React, { Component } from 'react';
import './Pages.css'
import StoredPage from './StoredPage'

class Pages extends Component {
  render() {
    const books = this.props.books.map((book) => <StoredPage key={book.id} name={book.title} path={book.path} />);
    return (<div className="Pages">{books}</div>);
  }
}
export default Pages;
