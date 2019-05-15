import React, { Component } from 'react';
import { Card, CardText, CardTitle, CardSubtitle, Button } from 'reactstrap';

class OfferCard extends Component {

  render () {
    let { id, precio, numReg, esquema } = this.props.offer;

    const cardStyle = {
      margin: "30px"
    };

    const titleStyle = {
      marginTop: "10px",
      fontSize: "30px"
    };

    return (
      <div>
        <Card style={cardStyle} >
            <CardTitle style={titleStyle} ><b>{precio} ETH</b></CardTitle>
            <CardSubtitle><b>{numReg} registros</b></CardSubtitle>
            <CardText>Esquema de datos: <b>{esquema}</b></CardText>
            <Button color="primary" onClick={() => this.props.buyOffer(id)}>Comprar</Button>
        </Card>
      </div>
    )
  }
}

export default OfferCard;