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

class ViewUnidade extends React.Component {

    viewModal = React.createRef()

    novaUnidade = async (unidade) => {
        if (this.state) for (const prop of Object.getOwnPropertyNames(this.state)) delete this.state[prop]
        this.setState({...unidade})
        return this.viewModal.current.show()
    }

    editarUnidade = async (unidade) => {
        Loading.Show();
        await new Service().Post('cadastros/unidade/editar', {unidade}).then((result) => this.setState({tipo: 2, ...result.data})).finally(() => Loading.Hide());
        return this.viewModal.current.show()
    }

    salvarUnidade = async () => {
        try {
        
            this.setState({submting: true})

            const unidade = _.pick(this.state, [
                'tipo',
                'unidade',
                'descricao',
            ])

            const errors = []
            
            if (_.isNil(unidade.unidade)) {
                errors.push('Informe o código!')
            }

            if (_.size(errors)) {
                await toaster.push(<Message showIcon type='warning'><ul>{errors.map((c) => <li>{c}</li>)}</ul></Message>, {placement: 'topEnd', duration: 5000 })
                return
            }

            await new Service().Post('cadastros/unidade/salvar', unidade).then(async (result) => {
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
                    <Modal.Header><Modal.Title><Container>Unidade</Container></Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Row gutterWidth={0}>
                            <Col md={3}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='text' value={this.state?.unidade} onChange={(event) => this.setState({unidade: event.target.value.toUpperCase()})} maxLength={2} readOnly={this.state?.tipo != 1} />
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
                        </Row>
                        
                    </Modal.Body>
                    <Modal.Footer>
                        <Button appearance="primary" color='green' onClick={this.salvarUnidade} disabled={this.state?.submting}>{this.state?.submting ? <><Loader /> &nbsp; Salvando...</> : <><MdCheckCircleOutline /> &nbsp; Salvar</>}</Button>
                    </Modal.Footer>
                </ViewModal>
            </Form>
        )

    }

}

export default ViewUnidade;