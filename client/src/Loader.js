
import React, { Component } from 'react';
import './Loader.css'

import {connect} from 'react-redux'

class Loader extends Component {
  render() {
    if(!this.props.loading) {
        return null;
    }
    return (<div className="Loader">&nbsp;</div>);
  }
}

const LoaderContainer = connect(
        state => {
            return {loading:state.app.isFetching};
        },
        dispatch => {
            return {};
        }
        )(Loader);
export default LoaderContainer;
