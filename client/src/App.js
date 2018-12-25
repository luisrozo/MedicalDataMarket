import React, { Component } from "react";
import IPFSInboxContract from "./IPFSInbox.json";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";
import ipfs from './ipfs';

import "./App.css";

class App extends Component {
  state = { 
    web3: null, 
    accounts: null, 
    contract: null,
    name: "",
    age: 0,
    illness: "",
    treatment: "",
    allergy: "",
    lastAppointment: "",
    ipfsHash: null,
    formIPFS: "",
    formAddress: "",
    receivedIPFS: "" 
  };

  handleName = this.handleName.bind(this);
  handleAge = this.handleAge.bind(this);
  handleIllness = this.handleIllness.bind(this);
  handleTreatment = this.handleTreatment.bind(this);
  handleAllergy = this.handleAllergy.bind(this);
  handleLastAppointment = this.handleLastAppointment.bind(this);
  handleReceiveIPFS = this.handleReceiveIPFS.bind(this);
  
  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();

      const accounts = await web3.eth.getAccounts();

      const Contract = truffleContract(IPFSInboxContract);
      Contract.setProvider(web3.currentProvider);
      const instance = await Contract.deployed();

      this.setState({
        web3, accounts, contract: instance
      });

      this.setEventListeners();

      var Mockaroo = require('mockaroo');
      var client = new Mockaroo.Client({
        apiKey: 'a4d41710'
      });

      client.generate({
        count: 1,
        fields: [{
          name: 'name',
          type: 'First Name'
        }, {
          name: 'age',
          type: 'Number',
          min: 20,
          max: 70
        }, {
          name: 'illness',
          type: 'Custom List',
          values: ['Urticaria', 'Cicatriz', 'Fibromatosis', 'Infección', 'Fístula', 'Intoxicación', 'Pólipo', 'Quiste', 'Úlcera']
        }, {
          name: 'treatment',
          type: 'Custom List',
          values: ['Antihistamínicos', 'Corticoides', 'Povidona yodada', 'Radioterapia', 'Amoxicilina - Ácido clavulánico', 'Gasometría', 'Cirujía']
        }, {
          name: 'allergy',
          type: 'Custom List',
          values: ['Ninguna', 'Cinc', 'Suero', 'Etanol', 'Látex', 'Nefopam', 'Estriol', 'Hierro', 'Oxazepam', 'Propofol', 'Aspirina']
        }, {
          name: "lastAppointment",
          type: 'Date',
          min: '01/01/2017',
          max: '12/31/2018',
          format: '%d/%m/%y'
        }]
      }).then(function(record) {
        this.setState({
          name: record.name,
          age: parseInt(record.age),
          illness: record.illness,
          treatment: record.treatment,
          allergy: record.allergy,
          lastAppointment: record.lastAppointment
        });
      }.bind(this));

    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.log(error);
    }
  };

  setEventListeners() {
    this.state.contract.inboxResponse()
      .on('data', result => {
        this.setState({receivedIPFS: result.args[0]})
      });
  }

  handleName(event) {
    this.setState({ name: event.target.value });
  }

  handleAge(event) {
    this.setState({ age: event.target.value });
  }

  handleIllness(event) {
    this.setState({ illness: event.target.value });
  }

  handleTreatment(event) {
    this.setState({ treatment: event.target.value });
  }

  handleAllergy(event) {
    this.setState({ allergy: event.target.value });
  }

  handleLastAppointment(event) {
    this.setState({ lastAppointment: event.target.value });
  }

  convertToBuffer = async(reader) => {
    const buffer = await Buffer.from(reader.result);
    this.setState({buffer});
  };

  onIPFSSubmit = async(event) => {
    event.preventDefault();

    const contract = this.state.contract
    const account = this.state.accounts[0]

    let patient = {
      name: this.state.name,
      age: this.state.age,
      illness: this.state.illness,
      treatment: this.state.treatment,
      allergy: this.state.allergy,
      lastAppointment: this.state.lastAppointment
    };

    var data = Buffer.from(JSON.stringify(patient));
    this.setState({ buffer: data });

    var ipfsResult = await ipfs.add(data)
    this.setState({ ipfsHash: ipfsResult[0].hash });

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

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1> Tus datos personales </h1>

        <h3>Selecciona qué datos clínicos autorizas para ser vendidos</h3>
        <form id="ipfs-hash-form" className="scep-form" onSubmit={this.onIPFSSubmit}>

          <label>
            Nombre <br /> <input type="text" value={this.state.name} onChange={this.handleName} />
          </label>
          <br /><br />

          <label>
            Edad <br /> <input type="number" value={this.state.age} onChange={this.handleAge} />
          </label>
          <br /><br />

          <label>
            Enfermedad <br /> <input type="text" value={this.state.illness} onChange={this.handleIllness} />
          </label>
          <br /><br />

          <label>
            Tratamiento <br /> <input type="text" value={this.state.treatment} onChange={this.handleTreatment} />
          </label>
          <br /><br />

          <label>
            Alergia <br /> <input type="text" value={this.state.allergy} onChange={this.handleAllergy} />
          </label>
          <br /><br />

          <label>
            Última cita <br /> <input type="text" value={this.state.lastAppointment} onChange={this.handleLastAppointment} />
          </label>
          <br /><br />

          <input type="submit" value="Submit" />

        </form>

        <p>Hash: {this.state.ipfsHash}</p>

        <h2>Recupera tus datos</h2>
        <button onClick={this.handleReceiveIPFS}>Recuperar</button>
        <p>Datos recuperados: {this.state.receivedIPFS}</p>
      </div>
    );
  }
}

export default App;
