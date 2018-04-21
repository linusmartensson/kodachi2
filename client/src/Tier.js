
import React, { Component } from 'react';
import Panel from './Panel'
import "./Tier.css"

class Tier extends Component{
  render() {
    const data = this.props.panels;

    var sizeSum = 0;
    data.map((panel) => {return sizeSum += panel.width || 33;});

    const panels = data.map((panel, index) => 
        <Panel classKey={"p"+index} key={panel.id} border={panel.border!==undefined?panel.border:'true'} width={((panel.width || 33)/sizeSum)*100} content={panel.content} />
    );

    return (<div className={"Tier "+this.props.classKey}>{panels}</div>);
  }
}


export default Tier;
