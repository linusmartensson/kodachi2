
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

            var mainRole = state.app.session.profile&&state.app.session.profile.mainRole?state.app.session.profile.mainRole:{role:'Konventare', xp:0, level:1};
            var nickname = state.app.session.profile&&state.app.session.profile.user?state.app.session.profile.user.nickname?state.app.session.profile.user.nickname:state.app.session.profile.user.givenName:"Främling";
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
