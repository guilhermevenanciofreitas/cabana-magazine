import React from "react";
import { Button, Form, Loader, Message, Modal, toaster } from 'rsuite';
import { Container, Row, Col } from 'react-grid-system';
import { AutoComplete, ViewModal } from "../../../controls";
import { MdCheckCircleOutline } from "react-icons/md";
import { Service } from "../../../service";
import { Loading } from "../../../App";

import _ from "lodash";
import { Search } from "../../../search";

class ViewTipoEntSai extends React.Component {

    viewModal = React.createRef()

    novoTipoEntSai = async (tipoEntSai) => {
        if (this.state) for (const prop of Object.getOwnPropertyNames(this.state)) delete this.state[prop]
        this.setState({...tipoEntSai})
        return this.viewModal.current.show()
    }

    editarTipoEntSai = async (codentsai) => {
        Loading.Show();
        await new Service().Post('cadastros/tipos-entrada-saida/editar', {codentsai}).then((result) => this.setState({...result.data})).finally(() => Loading.Hide());
        return this.viewModal.current.show()
    }

    salvar = async () => {
        try {

            this.setState({submting: true})

            const tipoEntSai = _.pick(this.state, [
                'codentsai',
                'tipo',
                'descricao',
                'orig',
                'dest'
            ])

            const errors = []

            if (_.isEmpty(tipoEntSai.tipo)) {
                errors.push('Informe o tipo!')
            }

            if (_.isEmpty(tipoEntSai.orig)) {
                errors.push('Informe a origem!')
            }

            if (_.isEmpty(tipoEntSai.dest)) {
                errors.push('Informe o destino!')
            }

            if (_.size(errors)) {
                await toaster.push(<Message showIcon type='warning'><ul>{errors.map((c) => <li>{c}</li>)}</ul></Message>, {placement: 'topEnd', duration: 5000 })
                return
            }

            await new Service().Post('cadastros/tipos-entrada-saida/salvar', tipoEntSai).then(async (result) => {
                await toaster.push(<Message showIcon type='success'>Salvo com sucesso!</Message>, {placement: 'topEnd', duration: 5000 })
                this.viewModal.current?.close(result.data)
            })

        } catch (ex) {

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
                    <Modal.Header><Modal.Title><Container>Tipo de entrada/saída</Container></Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Row gutterWidth={0}>
                            <Col md={3}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='text' value={this.state?.codentsai} readOnly />
                                        <span>Código</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={9}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='text' value={this.state?.descricao} onChange={(event) => this.setState({descricao: event.target.value.toUpperCase()})} />
                                        <span>Descrição</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className='form-control'>
                                    <label className="textfield-filled">
                                        <select value={this.state?.tipo} onChange={(event) => this.setState({tipo: event.target.value})} >
                                            <option value="">[Selecione]</option>
                                            <option value="E">Entrada</option>
                                            <option value="S">Saída</option>
                                            <option value="A">Ambos</option>
                                        </select>
                                        <span>Tipo</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className='form-control'>
                                    <label className="textfield-filled">
                                        <select value={this.state?.orig} onChange={(event) => this.setState({orig: event.target.value})} >
                                            <option value="">[Selecione]</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <span>Origem</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className='form-control'>
                                    <label className="textfield-filled">
                                        <select value={this.state?.dest} onChange={(event) => this.setState({dest: event.target.value})} >
                                            <option value="">[Selecione]</option>
                                            <option value="S">Sim</option>
                                            <option value="N">Não</option>
                                        </select>
                                        <span>Destino</span>
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

export default ViewTipoEntSai;