


import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import './StoredPage.css'

class StoredPage extends Component {
  render() {
    return (<div className="StoredPage">
                <Link to={this.props.path}>{this.props.name}</Link>
            </div>);
  }
}
export default StoredPage;
