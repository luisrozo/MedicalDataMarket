import React, { Component } from "react";
import IPFSInboxContract from "./IPFSInbox.json";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";
import ipfs from './ipfs';
import { retrieveData, initOwner } from './services/retrieveOwnerData';
import { generateData } from './services/generateRandomData';
import { makeString } from './services/randomString';
import ReactDataGrid from "react-data-grid";
//import "./styles.css";
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
    //name: "",
    // age: 0,
    // illness: "",
    // checkIllness: false,
    // treatment: "",
    // checkTreatment: false,
    // allergy: "",
    // checkAllergy: false,
    // lastAppointment: "",
    // checkLastAppointment: false,
    // eth: 0,
    ipfsHash: null,
    ownerData: {},
    patientHashes: {},
    schemesCount: {},
    isDataSubmitted: false,
    isCustodian: false,
    custodianAccount: '0xCDD1c0407f7D4C6bf3DFB7cfc8e70d74B0fA99c3',
    selectedScheme: "",
    selectedRegNum: 0,
    offerCreationColumns: [{ key: 'nombre', name: 'Nombre'}, { key: 'edad', name: 'Edad'}],
    offerCreationRows: [],
    selectedIndexes: [],
    // formIPFS: "",
    // formAddress: "",
    // receivedIPFS: "" 
  };

  handleInputChange = this.handleInputChange.bind(this);
  handleOfferScheme = this.handleOfferScheme.bind(this);
  handleOfferNumber = this.handleOfferNumber.bind(this);
  
  componentWillMount = async () => {
    try {
      //alert("componentWillMount de App.js")
      const web3 = await getWeb3();
      //alert("Pasado web3")

      const accounts = await web3.eth.getAccounts();

      // const Contract = truffleContract(IPFSInboxContract);
      // Contract.setProvider(web3.currentProvider);
      //const instance = await Contract.deployed();

      // this.setState({
      //   web3, accounts, contract: instance
      // });
      //this.setState({ web3, accounts});

      // localStorage.setItem('contract', instance);
      localStorage.setItem('account', accounts[0]);
      //alert("isDataSubmitted a false")
      localStorage.setItem("isDataSubmitted", false);

      //----------------------------------------------------

      let rows = [];
      for (let i = 1; i < 20; i++) {
        rows.push({
          nombre: makeString(),
          edad: i * 2
        });
      }

      // this.setState({
      //   offerCreationRows: rows
      // })

      // ---------------------------------------------------

      // this.setEventListeners();

      var previousPatientHashes = JSON.parse(localStorage.getItem('patientHashes'));
      var previousSchemesCount = JSON.parse(localStorage.getItem('schemesCount'));
      var previousNumOfferFiles = JSON.parse(localStorage.getItem('numOfferFiles'));

      // this.setState({
      //   ownerData: initOwner(),
      //   patientHashes: previousPatientHashes,
      //   schemesCount: previousSchemesCount,
      //   numOfferFiles: previousNumOfferFiles
      // });

      //alert("Tipo de usuario")
      if(accounts[0] === this.state.custodianAccount) { // ¿El usuario es el custodian?
        //alert("Es el custodian")
        localStorage.setItem("isCustodian", true);
        this.setState({ loading: false });

      } else if(previousPatientHashes != null && accounts[0] in previousPatientHashes) { // Si es owner, ¿ha subido ya sus datos?
        //alert("Tiene los datos subidos")
        localStorage.setItem("isDataSubmitted", true);

        var userHash = previousPatientHashes[accounts[0]].hash
        //alert(userHash);

        ipfs.get(userHash, function (err, files) {
          files.forEach((file) => {
            var ownerData = JSON.parse(file.content);
            //alert("setOwnerData en App.js")
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

  // setEventListeners() {
  //   this.state.contract.inboxResponse()
  //     .on('data', result => {
  //       this.setState({receivedIPFS: result.args[0]})
  //     });
  // }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    var data = this.state.ownerData;
    data[name] = value;

    this.setState({
      ownerData: data
    });

    if(target.type === 'checkbox') {
      let modif = 0;
      let current = this.state.ownerData.eth;

      if(name === 'checkLastAppointment') {
        modif = 1;
      } else if(name === 'checkAllergy') {
        modif = 3;
      } else {
        modif = 5;
      }

      if(!value) {
        modif *= -1;
      }

      data.eth = current + modif;

      this.setState({
        ownerData: data
      });
    }
  }

  convertToBuffer = async(reader) => {
    const buffer = await Buffer.from(reader.result);
    this.setState({buffer});
  };

  onIPFSSubmit = async(event) => {
    event.preventDefault();

    const contract = this.state.contract
    const account = this.state.accounts[0]

    var patient = this.state.ownerData;

    var data = Buffer.from(JSON.stringify(patient));
    this.setState({ buffer: data });

    // Hash donde se alojan los datos del paciente
    var ipfsResult = await ipfs.add(data)
    this.setState({ ipfsHash: ipfsResult[0].hash });

    // Esquema de los datos seleccionados
    var dataScheme = "";

    if(patient.checkIllness) {
      dataScheme = dataScheme.concat('enfermedad,')
    }
    if(patient.checkTreatment) {
      dataScheme = dataScheme.concat('tratamiento,')
    }
    if(patient.checkAllergy) {
      dataScheme = dataScheme.concat('alergia,')
    }
    if(patient.checkLastAppointment) {
      dataScheme = dataScheme.concat('ultimacita,')
    }

    if(dataScheme.localeCompare("")) {
      dataScheme = dataScheme.slice(0, -1);
    }

    // Montar tabla hash

    var hashes = this.state.patientHashes;
    if(hashes == null) {
      hashes = {}
    }
    hashes[account] = { hash: ipfsResult[0].hash, scheme: dataScheme };
    this.setState({ patientHashes: hashes });

    //alert(hashes[account].hash);

    // Actualizar conteo de esquemas

    var schemes = this.state.schemesCount;

    if(schemes == null) {
      schemes = {}
    }

    var newSchemesCount = 1;

    if(dataScheme in schemes) {
      newSchemesCount = schemes[dataScheme] + 1;
      schemes[dataScheme] = newSchemesCount;
    } else {
      schemes[dataScheme] = 1;
    }

    //alert(Object.keys(schemes).length);

    /*if(newSchemesCount % 2 === 0) {
      this.createOfferFile();
    }*/

    this.setState({ schemesCount: schemes });

    //alert(schemes[dataScheme]);

    localStorage.setItem('patientHashes', JSON.stringify(hashes));
    localStorage.setItem('schemesCount', JSON.stringify(schemes));

    contract.uploadIPFS(this.state.ipfsHash, {from: account})
      .then(result => { 
        alert("Contract used!");
      })
  };

  handleReceiveIPFS(event) {
    event.preventDefault();
    const contract = this.state.contract
    const account = this.state.accounts[0]
    contract.getIPFS({from: account})
  }

  createOfferFile() {

    if(this.state.numOfferFiles !== 0) {
      this.setState({
        numOfferFiles: localStorage.getItem('numOfferFiles')
      });
    }

    let offer = {
      offerId: this.state.numOfferFiles + 1,
      entity: this.state.entity,
      scheme: "",
      numRecords: 2,
      price: 0
    }

    this.setState({ numOfferFiles: this.state.numOfferFiles + 1 });

    var offerFile = Buffer.from(JSON.stringify(offer));
    //var ipfsResult = await ipfs.add(offerFile)

    // Obtenemos IPFS hash de OfferFile, que irá en Claim File
    //var ipfsOffer = ipfsResult[0].hash;

    localStorage.setItem('numOfferFiles', this.state.numOfferFiles);
  }

  handleOfferScheme(event) {
    localStorage.setItem('selectedScheme', event.target.value)
  }

  handleOfferNumber(event) {
    localStorage.setItem('selectedRegNum', event.target.value)   
  }

  handleOfferCreation = async(event) => {
    event.preventDefault();
    var schemes = JSON.parse(localStorage.getItem('schemesCount'));
    var selectedScheme = localStorage.getItem('selectedScheme');
    var selectedRegNum = localStorage.getItem('selectedRegNum');
    var maxReg = schemes[selectedScheme];

    if(selectedRegNum < 1 || selectedRegNum > maxReg) {
      alert('No se pueden seleccionar ' + selectedRegNum + ' registros')
    } else {
      var numOfferFiles = this.state.numOfferFiles;
      var newNumOfferFiles = numOfferFiles + 1;
      localStorage.setItem('numOfferFiles', newNumOfferFiles);

      let offer = {
        offerId: newNumOfferFiles,
        entity: this.state.entity,
        scheme: selectedScheme,
        numRecords: selectedRegNum,
        price: 10
      }

      localStorage.setItem('offer', JSON.stringify(offer));
    }
  }

// ----------------------------------------------------------------

  onRowsSelected = rows => {
    this.setState({
      selectedIndexes: this.state.selectedIndexes.concat(
        rows.map(r => r.rowIdx)
      )
    });
  };

  onRowsDeselected = rows => {
    let rowIndexes = rows.map(r => r.rowIdx);
    this.setState({
      selectedIndexes: this.state.selectedIndexes.filter(
        i => rowIndexes.indexOf(i) === -1
      )
    });
  };

  // ---------------------------------------------------------------

  rowGetter = i => {
    return this.state.offerCreationRows[i]
  }

  render() {
    //const isDataSubmitted = localStorage.getItem('isDataSubmitted');
    const {schemesCount} = this.state;
    const account = localStorage.getItem('account');
    const contract = this.state.contract;

    // if (!this.state.web3) {
    //   return <div>Loading Web3, accounts, and contract...</div>;
    // }
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
