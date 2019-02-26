import React, { Component } from "react";

class Custodian extends Component {

  render() {
    const schemesCount = JSON.parse(localStorage.getItem('schemesCount'));
    return (
      <div><center>
        <h1>¡Eres el custodian!</h1>

        <h3>Estos son los esquemas disponibles para crear ofertas</h3>

        {
            Object.keys(schemesCount).map((key, index) => ( 
              <p key={index}> {key} ({schemesCount[key]})</p>  
            ))      
        }
      </center></div>
    );
  }
  
};

export default Custodian;