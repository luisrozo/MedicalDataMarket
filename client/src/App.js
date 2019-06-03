import React, { Component } from "react";
import getWeb3 from "./utils/getWeb3";
import ipfs from './ipfs';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import BuyOffers from './components/BuyOffers';
import NewUser from './components/NewUser';
import OwnerData from './components/OwnerData';
import Custodian from './components/Custodian';
import PageWrapper from './components/PageWrapper';
import PurchasedOffers from './components/PurchasedOffers';

import "./App.css";

class App extends Component {
  state = { 
    loading: true,
    web3: null, 
    accounts: null, 
    contract: null,
    numOfferFiles: 0,
    offerPatients: {},
    entity: "Mayo clinic",
    ipfsHash: null,
    ownerData: {},
    patientHashes: {},
    schemesCount: {},
    isDataSubmitted: false,
    isCustodian: false,
    custodianAccount: '0xCDD1c0407f7D4C6bf3DFB7cfc8e70d74B0fA99c3',
  };
  
  componentWillMount = async () => {
    document.title = "Medical Data Market";
    
    try {      
      
      const web3 = await getWeb3();

      const accounts = await web3.eth.getAccounts();

      localStorage.setItem('account', accounts[0]);
      localStorage.setItem("isDataSubmitted", false);


      var previousPatientHashes = JSON.parse(localStorage.getItem('patientHashes'));

      if(accounts[0] === this.state.custodianAccount) { 
        localStorage.setItem("isCustodian", true);
        this.setState({ loading: false });

      } else if(previousPatientHashes != null && accounts[0] in previousPatientHashes) { 
        localStorage.setItem("isDataSubmitted", true);

        var userHash = previousPatientHashes[accounts[0]].hash
        

        ipfs.get(userHash, function (err, files) {
          files.forEach((file) => {
            var ownerData = JSON.parse(file.content);
            localStorage.setItem('ownerData', JSON.stringify(ownerData));
            this.setState({ loading: false });
          })
        }.bind(this));

      } else {
        this.setState({ loading: false });
      }

    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.log(error);
    }
  };

  render() {
    const account = localStorage.getItem('account');

    if(this.state.loading) {
      return <div>Loading...</div>
    }
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" render={(props) => <PageWrapper {...props} 
                                                    account={account} />} />
          <Route path="/ownerData" component={OwnerData} />
          <Route path="/buyOffers" component={BuyOffers} />
          <Route path="/purchasedOffers" component={PurchasedOffers} />
          <Route path="/newUser" component={NewUser} />          
          <Route path="/custodian" component={Custodian} />          
        </Switch>
      </BrowserRouter>
      
    );
  }
}

export default App;
