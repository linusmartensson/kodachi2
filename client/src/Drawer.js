
import React, { Component } from 'react';
import './Drawer.css'
import Toolbox from './Toolbox'
import ShortProfile from './ShortProfile'
class Drawer extends Component {
  constructor(props) {
    super(props);
    this.state = {open:true};
  }
  render() {
    return (<div className="Drawer">
                <ShortProfile />
                <Toolbox />
            </div>);
  }
}
export default Drawer;
