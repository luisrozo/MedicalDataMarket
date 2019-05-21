import React, { Component } from "react";
import Web3 from 'web3'
import IPFSInboxContract from "./../IPFSInbox.json";
import truffleContract from "truffle-contract";
import ipfs from './../ipfs';
import ReactTable from 'react-table';
import "react-table/react-table.css";
import { Alert } from 'reactstrap';
import {
  Navbar,
  NavbarBrand,
} from 'reactstrap';

import styles from './navbarStyle';

class Custodian extends Component {

  state = {
    web3: null,
    account: '',
    contract: null,
    schemeSelected: '',
    printTable: false,
    userColumns: [],
    userData: [],
    entidad: "Mayo Clinic",
    accounts: [],
    offer: {},
    offerFileIPFS: '',
    claimFileIPFS: '',
    visible: false,

  };

  handleSelectChange = this.handleSelectChange.bind(this);
  onDismiss = this.onDismiss.bind(this);

  getProps=() => {
    return {
      style: {
        marginBottom: "50px",
        marginRight: "250px",
        marginLeft: "250px",
        marginTop: "50px"
      }
    }
  }

  componentWillMount = async () => {
    document.body.style.paddingBottom = "200px";

    this.loadBlockchainData();
  }

  async loadBlockchainData() {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:3000");
    const accounts = await web3.eth.getAccounts();

    const Contract = truffleContract(IPFSInboxContract);
    Contract.setProvider(web3.currentProvider);
    const instance = await Contract.deployed();

    let previousNumOffers = localStorage.getItem("previousNumOffers");
    let currentOffers = JSON.parse(localStorage.getItem('offers'));

    let visible = false;

    if(currentOffers !== null && currentOffers.length > previousNumOffers) {
      visible = true;
    }

    localStorage.setItem("previousNumOffers", previousNumOffers+1)

    this.setState({ web3, account: accounts[0], contract: instance, visible }, () => { this.setEventListeners(); });

  }

  setEventListeners() {
    this.state.contract.claimFileUploaded()
      .on('data', result => {
        console.log(result.args[1])
      });
  }
  
  handleSelectChange(event) {
    let schemeSelected = event.target.value;
    let patientHashes = JSON.parse(localStorage.getItem('patientHashes'));

    // Añadir columnas a this.state.userColumns
    let userColumns = this.getUserColumns(schemeSelected);
    this.setState({ 
      schemeSelected, 
      userColumns, 
      userData: [], 
      printTable: false, 
      offer: {},
      accounts: [],
    });   

    // Conseguir datos de los usuarios a mostrar
    let nUsers = 0;
    Object.keys(patientHashes).forEach(function(key) {      
      if(patientHashes[key].scheme === schemeSelected) {
        nUsers = nUsers + 1;
      }
    });

    let nRows = 0;
    Object.keys(patientHashes).forEach(function(key) {      
      
      if(patientHashes[key].scheme === schemeSelected) {
        let userHash = patientHashes[key].hash;

        ipfs.get(userHash, function (err, files) {
          files.forEach((file) => {
            let userData = this.state.userData;
            let user = JSON.parse(file.content);
            let dataValue = this.generateDataValue(user, key);
            userData.push(dataValue);

            nRows = nRows + 1;

            if(nRows === nUsers) {
              this.setState({ printTable: true });
            }

          })
        }.bind(this));      
      }

    }.bind(this));
  }

  getUserColumns(scheme) {
    let userColumns = [
      {
        Header: "Nombre",
        accessor: "nombre",
      },
      {
        Header: "Edad",
        accessor: "edad"
      }
    ];

    if(scheme.includes("enfermedad")) {
      userColumns.push({ Header: "Enfermedad", accessor: "enfermedad", filterable: true });
    }
    if(scheme.includes("tratamiento")) {
      userColumns.push({ Header: "Tratamiento", accessor: "tratamiento", filterable: true });
    }
    if(scheme.includes("alergia")) {
      userColumns.push({ Header: "Alergia", accessor: "alergia", filterable: true });
    }
    if(scheme.includes("ultimacita")) {
      userColumns.push({ Header: "Última cita", accessor: "ultimacita", filterable: true });
    }

    userColumns.push({ 
      Header: "Añadir a oferta",
      sortable: false,
      Cell: props => {
        return <button
                  style={{ backgroundColor: "green", color: "#fefefe" }}
                  onClick={() => {
                    this.addRowToOffer(props.index, props.original, scheme);
                  }}
                >Añadir</button>
      }
    });

    return userColumns;
  }

  addRowToOffer(index, row, scheme) {
    let offer = this.state.offer;
    let userData = this.state.userData;
    let offers = JSON.parse(localStorage.getItem('offers'));
    console.log("offers, ", offers);
    if (offers === null) {
      offers = []
    }

    this.setState({ printTable: false });

    if(Object.keys(offer).length === 0) {
      offer = {
        id: offers.length + 1,
        entidad: this.state.entidad,
        esquema: scheme,
        numReg: 1,
        precio: this.getPrice(scheme)
      }
      
    } else {
      offer['numReg'] += 1;
      offer['precio'] += this.getPrice(scheme);
    }

    userData.splice(index, 1);

    this.setState(prevState => ({
      accounts: [...prevState.accounts, row.account]
    }))

    this.setState(
      { userData, offer },
      () => this.setState({ printTable: true })
    );
    
  }

  getPrice(scheme) {
    let price = 1;

    if(scheme.includes("enfermedad")) {
      price = price + 5;
    }
    if(scheme.includes("tratamiento")) {
      price = price + 5;
    }
    if(scheme.includes("alergia")) {
      price = price + 3;
    }
    if(scheme.includes("ultimacita")) {
      price = price + 1;
    }

    return price;
  }

  generateDataValue(user, account) {
    let dataValue = {
      account: account,
      nombre: user.name,
      edad: user.age
    }

    if(user.checkIllness) {
      dataValue['enfermedad'] = user.illness;
    }
    if(user.checkTreatment) {
      dataValue['tratamiento'] = user.treatment;
    }
    if(user.checkAllergy) {
      dataValue['alergia'] = user.allergy;
    }
    if(user.checkLastAppointment) {
      dataValue['ultimacita'] = user.lastAppointment;
    }

    return dataValue;
  }

  onOfferSubmit = async(event) => {
    let offers = JSON.parse(localStorage.getItem('offers'));
    if(offers === null) {
      offers = [];
    }

    localStorage.setItem('previousNumOffers', offers.length);

    offers.push({
      id: this.state.offer.id,
      esquema: this.state.offer.esquema,
      accounts: this.state.accounts,
      precio: this.state.offer.precio
    });

    localStorage.setItem('offers', JSON.stringify(offers));

    let offerFile = Buffer.from(JSON.stringify(this.state.offer));
    ipfs.files.add(offerFile, (error, result) => {
      if(error) {
        console.error(error)
        return
      }
      this.setState({ offerFileIPFS: result[0].hash }, () => { this.createClaimFile(); });
    });

  }

  createClaimFile = async(event) => {
    
    var signature = await this.state.web3.eth.personal.sign(this.state.offerFileIPFS, this.state.account);
    
    let claim = {
      offerFileIPFS: this.state.offerFileIPFS,
      signature: signature
    }

    let claimFile = Buffer.from(JSON.stringify(claim));
    ipfs.files.add(claimFile, (error, result) => {
      if(error) {
        console.error(error)
        return
      }
      this.setState({ claimFileIPFS: result[0].hash }, () => { this.addOfferToBlockchain(); });
      console.log("claimFile IPFS hash, ", result[0].hash);
    });
  }

  addOfferToBlockchain = async(event) => {
    let claimIPFS = this.state.claimFileIPFS;
    let snomedCodes = this.getSnomedCodes(this.state.offer.esquema);
    let contract = this.state.contract;

    contract.newOffer(claimIPFS, snomedCodes, {from: this.state.account})
      .then(result => {
        window.location.reload();
      })
  }

  getSnomedCodes(scheme) {
    let codes = '';

    if(scheme.includes("enfermedad")) {
      codes = codes.concat('64572001,');
    }
    if(scheme.includes("tratamiento")) {
      codes = codes.concat('276239002,');
    }
    if(scheme.includes("alergia")) {
      codes = codes.concat('473011001,');
    }
    if(scheme.includes("ultimacita")) {
      codes = codes.concat('185353001,');
    }

    return codes;
  }

  onDismiss() {
    this.setState({ visible: false });
  }

  render() {
    const schemesCount = JSON.parse(localStorage.getItem('schemesCount'));
    const numSchemes = Object.keys(schemesCount).length;
    const columns = [
      {
        Header: "Esquema",
        accessor: "esquema",
      },
      {
        Header: "Núm. Registros",
        accessor: "numReg"
      }
    ]
    var data = [];
    for (var i = 0; i < numSchemes; i++) {
      var key = Object.keys(schemesCount)[i];
      var value = schemesCount[key];
      var dataValue = {
        esquema: key,
        numReg: value
      }
      data.push(dataValue);
    }

    let printTable = this.state.printTable;
    const offer = this.state.offer;

    let emptyOffer = false;

    if(Object.keys(offer).length === 0)
      emptyOffer = true;

    return (
      <div>
        <Navbar style={styles.custodianNavBarStyle} expand="md">
          <NavbarBrand style={styles.navBarBrandStyle} href="/custodian">Medical Data Market</NavbarBrand>
        </Navbar>
        <center>
        <h1>¡Eres el custodian!</h1>

        <h3>Estos son los esquemas disponibles para crear ofertas</h3>

        <ReactTable
          columns={columns}
          data={data}
          showPagination={false}
          minRows={0}
          getProps={this.getProps}
        >
        </ReactTable>

        <form onSubmit={this.onOfferSubmit}>
          <label>
            Selecciona un esquema para empezar a crear una oferta<br />
            <select value={this.state.schemeSelected || ''} onChange={this.handleSelectChange}>
              <option value='' disabled>Selecciona un esquema...</option>
              {
                Object.keys(schemesCount).map((key) => ( 
                  <option key={key} value={key}>{key}</option>
                ))  
              }
            </select>
          </label>
        </form>

        { printTable ?
          <React.Fragment>
            <ReactTable
              columns={this.state.userColumns}
              data={this.state.userData}
              showPagination={false}
              minRows={0}
              getProps={this.getProps}
              noDataText='No quedan registros con el esquema seleccionado'
            >
            </ReactTable>
          </React.Fragment>
          :
          <React.Fragment>
            
          </React.Fragment>
        }

        <h3>Oferta</h3>

        { emptyOffer ? 
          <React.Fragment>
            <p><i>Aún no has añadido ningún registro. Empieza por seleccionar un esquema y añade registros a la oferta.</i></p>
          </React.Fragment>
          :
          <React.Fragment>
            <p><b>Entidad</b>: {offer.entidad} </p>
            <p><b>Esquema</b>: {offer.esquema} </p>
            <p><b>Número de registros</b>: {offer.numReg} </p>
            <p><b>Precio</b>: {offer.precio} </p>

            <button
              style={{ backgroundColor: "blue", color: "#fefefe" }}
              onClick={() => {
                this.onOfferSubmit();
              }}
            >Crear oferta</button>
          </React.Fragment>
        }
        
        <Alert color="info" isOpen={this.state.visible} toggle={this.onDismiss}>
        Oferta subida con éxito
        </Alert>


      </center></div>
    );
  }
  
};

export default Custodian;