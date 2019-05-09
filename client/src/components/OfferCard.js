import React, { Component } from 'react';
import { Card, CardText, CardTitle, CardSubtitle, Button } from 'reactstrap';

class OfferCard extends Component {

  render () {
    let { id, precio, numReg, esquema } = this.props.offer;
    return (
      <div>
        <Card>
            <CardTitle>Precio: <b>{precio} ETH</b></CardTitle>
            <CardSubtitle><b>{numReg} registros</b></CardSubtitle>
            <CardText>Esquema de datos: <b>{esquema}</b></CardText>
            <Button color="primary" onClick={() => this.props.buyOffer(id)}>Comprar</Button>
        </Card>
      </div>
    )
  }
}

export default OfferCard;