
import React, { Component } from 'react';
import './Loader.css'

import {connect} from 'react-redux'

class Loader extends Component {
  render() {
    if(!this.props.loading) {
        console.dir("No :(");
        return null;
    }
    console.log("YO");
    return (<div className="Loader">&nbsp;</div>);
  }
}

const LoaderContainer = connect(
        state => {
            console.dir("loading state:"+state.isFetching);
            return {loading:state.isFetching};
        },
        dispatch => {
            return {};
        }
        )(Loader);
export default LoaderContainer;
