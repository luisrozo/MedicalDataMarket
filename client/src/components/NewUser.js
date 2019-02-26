import React, { Component } from "react";
import { generateData } from './../services/generateRandomData';
import ipfs from './../ipfs';
import { Redirect } from 'react-router-dom'

class NewUser extends Component {

  state = {
    ownerData: {
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
      eth: 0
    },
    buffer: '',
    ipfsHash: '',
    patientHashes: {},
    schemesCount: {},
    goToOwnerData: false
  }

  handleInputChange = this.handleInputChange.bind(this);

  componentWillMount = async () => {
    var newOwnerData = await generateData();

    this.setState({
      ownerData: newOwnerData
    });
  }

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
  
  onIPFSSubmit = async(event) => {
    event.preventDefault();

    const account = localStorage.getItem('account');
    var patient = this.state.ownerData;
    localStorage.setItem('ownerData', JSON.stringify(patient));

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

    let hashes = JSON.parse(localStorage.getItem('patientHashes'));
    if(hashes == null) {
      hashes = {}
    }
    hashes[account] = { hash: ipfsResult[0].hash, scheme: dataScheme };
    //this.setState({ patientHashes: hashes });

    // Actualizar conteo de esquemas

    let schemes = JSON.parse(localStorage.getItem('schemesCount'));
    if(schemes == null) {
      schemes = {}
    }

    let newSchemesCount = 1;

    if(dataScheme in schemes) {
      newSchemesCount = schemes[dataScheme] + 1;
      schemes[dataScheme] = newSchemesCount;
    } else {
      schemes[dataScheme] = 1;
    }

    localStorage.setItem('patientHashes', JSON.stringify(hashes));
    localStorage.setItem('schemesCount', JSON.stringify(schemes));

    this.setState({ goToOwnerData: true });

    // contract.uploadIPFS(this.state.ipfsHash, {from: account})
    //   .then(result => { 
    //     alert("Contract used!");
    //   })
  };
  
  render() {
    if(this.state.goToOwnerData) {
      return <Redirect to="/ownerData" />
    }
    return (
      <div><center>
        <h3>Selecciona qué datos clínicos autorizas para ser vendidos</h3>
        <form id="ipfs-hash-form" className="scep-form" onSubmit={this.onIPFSSubmit}>

          <label>
            Nombre 
            <br /> 
            <input name="name" type="text" value={this.state.ownerData.name || ''} onChange={this.handleInputChange} />
          </label>
          <br /><br />

          <label>
            Edad 
            <br /> 
            <input name="age" type="number" value={this.state.ownerData.age || 0} onChange={this.handleInputChange} />
          </label>
          <br /><br />

          <label>
            Enfermedad <input name="checkIllness" type="checkbox" checked={this.state.ownerData.checkIllness || false} onChange={this.handleInputChange} />
            <br /> 
            <input name="illness" type="text" value={this.state.ownerData.illness || ''} onChange={this.handleInputChange} />
          </label>
          <br /><br />

          <label>
            Tratamiento <input name="checkTreatment" type="checkbox" checked={this.state.ownerData.checkTreatment || false} onChange={this.handleInputChange} />
            <br /> 
            <input name="treatment" type="text" value={this.state.ownerData.treatment || ''} onChange={this.handleInputChange} />
          </label>
          <br /><br />

          <label>
            Alergia <input name="checkAllergy" type="checkbox" checked={this.state.ownerData.checkAllergy || false} onChange={this.handleInputChange} />
            <br /> 
            <input name="allergy" type="text" value={this.state.ownerData.allergy || ''} onChange={this.handleInputChange} />
          </label>
          <br /><br />

          <label>
            Última cita <input name="checkLastAppointment" type="checkbox" checked={this.state.ownerData.checkLastAppointment || false} onChange={this.handleInputChange} />
            <br /> 
            <input name="lastAppointment" type="text" value={this.state.ownerData.lastAppointment || ''} onChange={this.handleInputChange} />
          </label>
          <br /><br />

          <input type="submit" value="Submit" />

        </form>

        <p>Hash: {this.state.ipfsHash}</p>
        <br />
        <h3>Ganarás:</h3>
        <h4><span style={{color: 'blue'}}> {this.state.ownerData.eth || 0} ETH </span></h4>
      </center></div>
    );
  }
};

export default NewUser;