import React from "react";
import { Button, Form, Modal } from 'rsuite';
import { Container, Row, Col } from 'react-grid-system';
import { ViewModal } from "../../controls";
import { MdCheckCircleOutline } from "react-icons/md";
import Swal from "sweetalert2";

import _ from "lodash";

export class ViewEntradaSaida extends React.Component {

    viewModal = React.createRef()

    editar = async (item) => {
        
        this.setState({item})

        return this.viewModal.current.show()
    }

    salvar = async () => {

        if (_.isEmpty(this.state.item.codcaixa)) {
            const result = await new Promise((resolve) => {
                Swal.fire({showCloseButton: true, title: 'Ops...', icon: 'question', text: 'Não foi informado o cód. caixa!', confirmButtonText: 'Continuar', allowOutsideClick: false, allowEscapeKey: true}).then((result) => {
                    resolve(result)
                })
            })

            if (result.isDismissed) {
                return
            }

        }

        this.viewModal.current?.close(this.state?.item)

    }
    
    close(item) {
        this.viewModal.current?.close(item)
    }

    render = () => {
        
        return (
            <Form autoComplete='off' onSubmit={this.submit}>
                <ViewModal ref={this.viewModal} size={600}>
                    <Modal.Header><Modal.Title><Container>Item</Container></Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Row gutterWidth={0}>
                            <Col md={3}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='text' value={this.state?.item?.trans_cab} readOnly />
                                        <span>Número</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={9}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='text' value={`${this.state?.item?.nome1} ${this.state?.item?.nome2}`} readOnly />
                                        <span>Cliente</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={12}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='text' value={this.state?.item?.descricao} readOnly />
                                        <span>Produto</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='text' value={this.state?.item?.codcaixa} onChange={(event) => this.setState({item: {...this.state.item, codcaixa: event.target.value}})} autoFocus />
                                        <span>Cód. caixa</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='text' value={this.state?.item?.codbarra} readOnly tabIndex={-1} />
                                        <span>Cód. barras</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={12}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='text' value={this.state?.item?.obs} onChange={(event) => this.setState({item: {...this.state.item, obs: event.target.value}})} />
                                        <span>Observação</span>
                                    </label>
                                </div>
                            </Col>
                        </Row>
                        
                    </Modal.Body>
                    <Modal.Footer>
                        <Button appearance="primary" color='green' onClick={this.salvar}><MdCheckCircleOutline /> &nbsp; Fechar</Button>
                    </Modal.Footer>
                </ViewModal>
            </Form>
        )

    }

}