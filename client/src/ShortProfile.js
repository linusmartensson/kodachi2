
import React, { Component } from 'react';
import './ShortProfile.css'
import {Link} from 'react-router-dom';

import {connect} from 'react-redux'

class ShortProfile extends Component {
  render() {
    return (<div className="ShortProfile">
                <Link to="/profile/me"><img src="/img/fyrklover.png" alt="" />
                <p>Tjenare {this.props.nickname}!</p>
                <p>Level {this.props.level} {this.props.rolename}</p></Link>
            </div>);
  }
}

const ShortProfileContainer = connect(
        state => {
            console.dir(state.session.profile);
            var mainRole = state.session.profile&&state.session.profile.mainRole?state.session.profile.mainRole:{role:'Konventare', xp:0, level:1};
            var nickname = state.session.profile&&state.session.profile.user?state.session.profile.user.nickname?state.session.profile.user.nickname:state.session.profile.user.givenName:"Främling";
            return {
                nickname,
                rolename:mainRole.role,
                level: mainRole.level
                };
        },
        dispatch => {
            return {};
        }
        )(ShortProfile);
export default ShortProfileContainer;
