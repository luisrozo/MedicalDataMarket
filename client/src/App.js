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
    numOfferFiles: 0,
    offerPatients: {},
    entity: "Mayo clinic",
    name: "",
    age: 0,
    illness: "",
    checkIllness: false,
    treatment: "",
    checkTreatment: false,
    allergy: "",
    checkAllergy: false,
    lastAppointment: "",
    checkLastAppointment: false,
    eth: 0,
    ipfsHash: null,
    patientHashes: {},
    schemesCount: {},
    isDataSubmitted: false,
    formIPFS: "",
    formAddress: "",
    receivedIPFS: "" 
  };

  handleInputChange = this.handleInputChange.bind(this);
  
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

      var previousPatientHashes = JSON.parse(localStorage.getItem('patientHashes'));
      var previousSchemesCount = JSON.parse(localStorage.getItem('schemesCount'));

      this.setState({
        patientHashes: previousPatientHashes,
        schemesCount: previousSchemesCount
      });

      // ¿El usuario ya ha subido a IPFS sus datos o no?
      if(this.state.patientHashes != null && accounts[0] in this.state.patientHashes) {
        this.setState({ isDataSubmitted: true })

        var userHash = this.state.patientHashes[accounts[0]].hash

        ipfs.get(userHash, function (err, files) {
          files.forEach((file) => {
            var patient = JSON.parse(file.content);
            this.setState({
              name: patient.name,
              age: patient.age,
              illness: patient.illness,
              checkIllness: patient.checkIllness,
              treatment: patient.treatment,
              checkTreatment: patient.checkTreatment,
              allergy: patient.allergy,
              checkAllergy: patient.checkAllergy,
              lastAppointment: patient.lastAppointment,
              checkLastAppointment: patient.checkLastAppointment,
              eth: patient.eth,
            });
          })
        }.bind(this))

      } else {
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
            lastAppointment: record.lastAppointment,
            eth: 1
          });
        }.bind(this));
      };

      //if(previousPatientHashes != null)
       // alert(previousPatientHashes[accounts[0]].hash);

      /*this.setState({
        patientHashes
      });

      if(accounts[0] in this.state.patientHashes) {
        alert('Ya existe ese paciente')
      } else {
        alert('No existe ese paciente')
      }*/      

    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.log(error);
    }
  };

  componentWillMount() {
    //localStorage.setItem('state', JSON.stringify(this.state));
  }

  setEventListeners() {
    this.state.contract.inboxResponse()
      .on('data', result => {
        this.setState({receivedIPFS: result.args[0]})
      });
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });

    if(target.type === 'checkbox') {
      let modif = 0;
      let current = this.state.eth;

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

      this.setState({
        eth: current + modif
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

    let patient = {
      name: this.state.name,
      age: this.state.age,
      illness: this.state.illness,
      checkIllness: this.state.checkIllness,
      treatment: this.state.treatment,
      checkTreatment: this.state.checkTreatment,
      allergy: this.state.allergy,
      checkAllergy: this.state.checkAllergy,
      lastAppointment: this.state.lastAppointment,
      checkLastAppointment: this.state.checkLastAppointment,
      eth: this.state.eth
    };

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

    if(this.state.numOfferFiles != 0) {
      this.state.numOfferFiles = localStorage.getItem('numOfferFiles');
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

  render() {
    const isDataSubmitted = this.state.isDataSubmitted

    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1> Tus datos personales </h1>

        { isDataSubmitted ? 
          <React.Fragment>
            <h3>Estos son los datos que has autorizado para ser vendidos</h3>

            <label>
                <b>Nombre</b> 
                <br /> 
                {this.state.name}
              </label>
              <br /><br />

              <label>
                <b>Edad</b> 
                <br /> 
                {this.state.age}
              </label>
              <br /><br />

              {this.state.checkIllness && 
                <React.Fragment>
                  <label>
                    <b>Enfermedad</b> 
                    <br /> 
                    {this.state.illness}
                  </label>
                  <br /><br />
                </React.Fragment>
              }

              {this.state.checkAllergy && 
                <React.Fragment>
                  <label>
                    <b>Alergia</b> 
                    <br /> 
                    {this.state.allergy}
                  </label>
                  <br /><br />
                </React.Fragment>
              }

              {this.state.checkTreatment && 
                <React.Fragment>
                  <label>
                    <b>Tratamiento</b> 
                    <br /> 
                    {this.state.treatment}
                  </label>
                  <br /><br />
                </React.Fragment>
              }

              {this.state.checkLastAppointment && 
                <React.Fragment>
                  <label>
                    <b>Última cita</b> 
                    <br /> 
                    {this.state.lastAppointment}
                  </label>
                  <br /><br />
                </React.Fragment>
              }

              <label>Ganarás <b><span style={{color: 'blue'}}> {this.state.eth} ETH </span></b> por la venta de estos datos</label>

          </React.Fragment> : 
          
          <React.Fragment>
            <h3>Selecciona qué datos clínicos autorizas para ser vendidos</h3>
            <form id="ipfs-hash-form" className="scep-form" onSubmit={this.onIPFSSubmit}>

              <label>
                Nombre 
                <br /> 
                <input name="name" type="text" value={this.state.name} onChange={this.handleInputChange} />
              </label>
              <br /><br />

              <label>
                Edad 
                <br /> 
                <input name="age" type="number" value={this.state.age} onChange={this.handleInputChange} />
              </label>
              <br /><br />

              <label>
                Enfermedad <input name="checkIllness" type="checkbox" checked={this.state.checkIllness} onChange={this.handleInputChange} />
                <br /> 
                <input name="illness" type="text" value={this.state.illness} onChange={this.handleInputChange} />
              </label>
              <br /><br />

              <label>
                Tratamiento <input name="checkTreatment" type="checkbox" checked={this.state.checkTreatment} onChange={this.handleInputChange} />
                <br /> 
                <input name="treatment" type="text" value={this.state.treatment} onChange={this.handleInputChange} />
              </label>
              <br /><br />

              <label>
                Alergia <input name="checkAllergy" type="checkbox" checked={this.state.checkAllergy} onChange={this.handleInputChange} />
                <br /> 
                <input name="allergy" type="text" value={this.state.allergy} onChange={this.handleInputChange} />
              </label>
              <br /><br />

              <label>
                Última cita <input name="checkLastAppointment" type="checkbox" checked={this.state.checkLastAppointment} onChange={this.handleInputChange} />
                <br /> 
                <input name="lastAppointment" type="text" value={this.state.lastAppointment} onChange={this.handleInputChange} />
              </label>
              <br /><br />

              <input type="submit" value="Submit" />

            </form>

            <p>Hash: {this.state.ipfsHash}</p>
            <br />
            <h3>Ganarás:</h3>
            <h4><span style={{color: 'blue'}}> {this.state.eth} ETH </span></h4>
          </React.Fragment>
        }

        {/* <h2>Recupera tus datos</h2> -->
        <button onClick={this.handleReceiveIPFS}>Recuperar</button>
        <p>Datos recuperados: {this.state.receivedIPFS}</p> */}
      </div>
    );
  }
}

export default App;
