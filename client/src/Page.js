
import React, { Component } from 'react';
import Tier from './Tier'

import './Page.css'

class Page extends Component{
  render() {

      console.dir(this.props.tiers);
    const tiers = this.props.tiers.map((tier) => 
        <Tier key={tier.id} panels={tier.panels} />
    );

    return (<div className="Page">{tiers}</div>);
  }
}

export default Page;
