import React from "react";
import { Button, Form, Loader, Message, Modal, toaster } from 'rsuite';
import { Container, Row, Col } from 'react-grid-system';
import { AutoComplete, ViewModal } from "../../../controls";
import { MdCheckCircleOutline } from "react-icons/md";
import { Service } from "../../../service";
import { Loading } from "../../../App";

import _ from "lodash";
import { Search } from "../../../search";
import { Exception } from "../../../utils/exception";

class ViewParceiro extends React.Component {

    viewModal = React.createRef()

    novoParceiro = async (parceiro) => {
        if (this.state) for (const prop of Object.getOwnPropertyNames(this.state)) delete this.state[prop]
        this.setState({...parceiro})
        return this.viewModal.current.show()
    }

    editarParceiro = async (codparc) => {
        Loading.Show();
        await new Service().Post('cadastros/parceiro/editar', {codparc}).then((result) => this.setState({...result.data})).finally(() => Loading.Hide());
        return this.viewModal.current.show()
    }

    salvar = async () => {
        try {

            this.setState({submting: true})

            const parceiro = _.pick(this.state, [
                'codparc',
                'nome',
                'tipo'
            ])

            const errors = []
            
            if (_.isNil(parceiro.tipo)) {
                errors.push('Informe o tipo!')
            }

            if (_.size(errors)) {
                await toaster.push(<Message showIcon type='warning'><ul>{errors.map((c) => <li>{c}</li>)}</ul></Message>, {placement: 'topEnd', duration: 5000 })
                return
            }

            await new Service().Post('cadastros/parceiro/salvar', parceiro).then(async (result) => {
                await toaster.push(<Message showIcon type='success'>Salvo com sucesso!</Message>, {placement: 'topEnd', duration: 5000 })
                this.viewModal.current?.close(result.data)
            })

        } catch (error) {
            Exception.error(error)
        } finally {
            this.setState({submting: false})
        }
    }

    close(role) {
        this.viewModal.current?.close(role)
    }

    render = () => {
        
        return (
            <Form autoComplete='off' onSubmit={this.submit}>
                <ViewModal ref={this.viewModal} size={700}>
                    <Modal.Header><Modal.Title><Container>Parceiro</Container></Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Row gutterWidth={0}>
                            <Col md={3}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='text' value={this.state?.codparc} readOnly />
                                        <span>Código</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={9}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='text' value={this.state?.nome} onChange={(event) => this.setState({nome: event.target.value.toUpperCase()})} />
                                        <span>Nome</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className='form-control'>
                                    <label className="textfield-filled">
                                        <select value={this.state?.tipo} onChange={(event) => this.setState({tipo: event.target.value})} >
                                            <option value="">[Selecione]</option>
                                            <option value="1">Cliente</option>
                                            <option value="2">Fornecedor</option>
                                            <option value="3">Ambos</option>
                                        </select>
                                        <span>Tipo</span>
                                    </label>
                                </div>
                            </Col>
                        </Row>
                        
                    </Modal.Body>
                    <Modal.Footer>
                        <Button appearance="primary" color='green' onClick={this.salvar} disabled={this.state?.submting}>{this.state?.submting ? <><Loader /> &nbsp; Salvando...</> : <><MdCheckCircleOutline /> &nbsp; Salvar</>}</Button>
                    </Modal.Footer>
                </ViewModal>
            </Form>
        )

    }

}

export default ViewParceiro;