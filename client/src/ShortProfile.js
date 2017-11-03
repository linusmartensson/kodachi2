
import React, { Component } from 'react';
import './ShortProfile.css'

import {connect} from 'react-redux'

class ShortProfile extends Component {
  render() {
    return (<div className="ShortProfile">
                <img src="/img/fyrklover.png" alt="" />
                <p>Nickname</p>
                <p>Level 21 Arrangör</p>
            </div>);
  }
}

const ShortProfileContainer = connect(
        state => {
            console.dir(state.session.profile);
            return {};
        },
        dispatch => {
            return {};
        }
        )(ShortProfile);
export default ShortProfileContainer;
