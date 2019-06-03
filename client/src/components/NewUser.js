import React, { Component } from "react";
import { generateData } from './../services/generateRandomData';
import ipfs from './../ipfs';
import { Redirect } from 'react-router-dom';
import {
	Navbar,
	NavbarBrand,
} from 'reactstrap';

import { Col, Row, Button, Form, FormGroup, Label, Input, Jumbotron, CustomInput } from 'reactstrap';

import styles from './navbarStyle';

class NewUser extends Component {

	state = {
		ownerData: {
			town: "",
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
        document.title = "Medical Data Market - Validar datos";
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

	};
	
	render() {
        const formStyle = {
            width: "700px",
        }

        const colStyle = {
			textAlign: "left",
			fontSize: "150%"
        }

		const inputStyle = {
			border: "none",
        }

		if(this.state.goToOwnerData) {
			return <Redirect to="/ownerData" />
		}
		return (
			<div>
				<Navbar style={styles.navBarStyle} color="dark" light expand="md">
					<NavbarBrand style={styles.navBarBrandStyle} href="/newUser">Medical Data Market</NavbarBrand>
				</Navbar>
				<center>
				<h2>Valida tus datos</h2>
				<h4>Selecciona qué datos clínicos autorizas para ser vendidos</h4><br />
				<Form style={formStyle} id="ipfs-hash-form" className="scep-form" onSubmit={this.onIPFSSubmit}>
                    <Row form>
                        <Col style={colStyle} md={6}>
                            <FormGroup>
                                <Label>Población</Label>
                                <Input style={inputStyle} readOnly size="60" name="town" type="text" value={this.state.ownerData.town || ''} onChange={this.handleInputChange} />
                            </FormGroup>
                        </Col>
                        <Col style={colStyle} md={6}>
                            <FormGroup>
                                <Label>Edad</Label>
                                <Input style={inputStyle} readOnly size="60" name="age" type="text" value={this.state.ownerData.age || ''} onChange={this.handleInputChange} />
                            </FormGroup>
                        </Col>
                    </Row>

                    <FormGroup style={colStyle} >
                        <CustomInput type="checkbox" id="checkIllness" name="checkIllness" label="Enfermedad" checked={this.state.ownerData.checkIllness || false} onChange={this.handleInputChange} />
                        <Input style={inputStyle} readOnly size="60" name="illness" type="text" value={this.state.ownerData.illness || ''} onChange={this.handleInputChange} />
                    </FormGroup>
                    
                    <FormGroup style={colStyle} >
                        <CustomInput type="checkbox" id="checkTreatment" name="checkTreatment" label="Tratamiento" checked={this.state.ownerData.checkTreatment || false} onChange={this.handleInputChange} />
                        <Input style={inputStyle} readOnly size="60" name="treatment" type="text" value={this.state.ownerData.treatment || ''} onChange={this.handleInputChange} />
                    </FormGroup>

                    <FormGroup style={colStyle} >
                        <CustomInput type="checkbox" id="checkAllergy" name="checkAllergy" label="Alergia" checked={this.state.ownerData.checkAllergy || false} onChange={this.handleInputChange} />
                        <Input style={inputStyle} readOnly size="60" name="allergy" type="text" value={this.state.ownerData.allergy || ''} onChange={this.handleInputChange} />
                    </FormGroup>

                    <FormGroup style={colStyle} >
                        <CustomInput type="checkbox" id="checkLastAppointment" name="checkLastAppointment" label="Última cita" checked={this.state.ownerData.checkLastAppointment || false} onChange={this.handleInputChange} />
                        <Input style={inputStyle} readOnly size="60" name="lastAppointment" type="text" value={this.state.ownerData.lastAppointment || ''} onChange={this.handleInputChange} />
                    </FormGroup>

                    <Button type="submit" color="primary">Validar</Button>

				</Form>

                <br /><br />

                <Jumbotron style={{ borderStyle: "groove", width: "700px" }}>
                    <p className="lead">Ganarás</p>
                    <h1 className="display-4" style={{color: 'blue'}}>{this.state.ownerData.eth || 0} Ether</h1>
                    <p className="lead">por la venta de tus datos.</p>
                    <p className="lead"><i>Cuanto más datos selecciones, más Ether ganarás.</i></p>
                    <hr className="my-2" />
                    <p>Si algún usuario de la plataforma compra una oferta que contenga tus datos, ganarás esta cantidad de Ether.</p>
                </Jumbotron>

				</center></div>
		);
	}
};

export default NewUser;