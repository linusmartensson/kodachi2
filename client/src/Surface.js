
import React, { Component } from 'react';
import Page from './Page'
class Surface extends Component {
  render() {
    const pages = this.props.pages.map((page) =>
            <Page key={page.id} tiers={page.tiers}/>
            );
    return (<div className="Surface" id={this.props.id} >{pages}</div>);
  }
}
export default Surface;
