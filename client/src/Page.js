
import React, { Component } from 'react';
import Tier from './Tier'

import './Page.css'

class Page extends Component{
  render() {

    const tiers = this.props.tiers.map((tier, index) => 
        <Tier key={tier.id} panels={tier.panels} classKey={"t"+index} />
    );

    return (<div className="Page">{tiers}</div>);
  }
}

export default Page;
