
import React, { Component } from 'react';
import Page from './Page'
class Surface extends Component {
  render() {
    console.dir('MAH PROPS');
    console.dir(this.props);
    const pages = this.props.pages.map((page) =>
            <Page key={page.id} tiers={page.tiers} />
            );
    return (<div className="Surface">{pages}</div>);
  }
}
export default Surface;
