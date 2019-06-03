import React, { Component } from "react";
import { Redirect } from 'react-router-dom'

class PageWrapper extends Component {

    render(){

        let isDataSubmitted = localStorage.getItem('isDataSubmitted');

        if(this.props.account === '0xCDD1c0407f7D4C6bf3DFB7cfc8e70d74B0fA99c3') {
            return <Redirect to="/custodian" />
        } else if(isDataSubmitted === 'true') {
            return <Redirect to="/ownerData" />
        } else {
            return <Redirect to="/newUser" />
        }
    }
}

export default PageWrapper;