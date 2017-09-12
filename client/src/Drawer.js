
import React, { Component } from 'react';
import './Drawer.css'
import Toolbox from './Toolbox'
import Pages from './Pages'
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
                <Pages />
            </div>);
  }
}
export default Drawer;
