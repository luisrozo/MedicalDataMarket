import React, { Component } from "react";
import { Redirect } from 'react-router-dom'

class PageWrapper extends Component {

    render(){

        let isDataSubmitted = localStorage.getItem('isDataSubmitted');

        //alert("Page wrapper")
        //alert("props.account: " + this.props.account);
        //alert("isDataSubmitted: " + isDataSubmitted);

        if(this.props.account === '0xCDD1c0407f7D4C6bf3DFB7cfc8e70d74B0fA99c3') {
            return <Redirect to="/custodian" />
        } else if(isDataSubmitted === 'true') {
            //alert("Vamos para ownerData")
            return <Redirect to="/ownerData" />
        } else {
            //alert("Vamos para newUser")
            return <Redirect to="/newUser" />
        }
    }
}

export default PageWrapper;