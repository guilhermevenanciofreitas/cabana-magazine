import React from "react";
import { Button, Form, Loader, Message, Modal, toaster } from 'rsuite';
import { Container, Row, Col } from 'react-grid-system';
import { AutoComplete, ViewModal } from "../../../controls";
import { MdCheckCircleOutline } from "react-icons/md";
import { Service } from "../../../service";
import { Loading } from "../../../App";

import _ from "lodash";
import { Search } from "../../../search";
import { Decimal } from "../../../utils/decimal";
import { Exception } from '../../../utils/exception'


class ViewProduto extends React.Component {

    viewModal = React.createRef()

    novoProduto = async (produto) => {
        Loading.Show();
        if (this.state) for (const prop of Object.getOwnPropertyNames(this.state)) delete this.state[prop]
        this.setState({...produto})
        await new Service().Post('cadastros/produto/carregar').then((result) => this.setState({...result.data})).finally(() => Loading.Hide())
        return this.viewModal.current.show()
    }

    editaProduto = async (codprod) => {
        Loading.Show();
        await new Service().Post('cadastros/produto/carregar').then((result) => this.setState({...result.data}))
        await new Service().Post('cadastros/produto/editar', {codprod}).then((result) => this.setState({...result.data})).finally(() => Loading.Hide())
        return this.viewModal.current.show()
    }

    salvar = async () => {
        try {

            this.setState({submting: true})

            const produto = _.pick(this.state, [
                'codprod',
                'descricao',
                'unidade',
                'custo'
            ])

            const errors = []
            
            if (_.isEmpty(produto.unidade)) {
                errors.push('Informe a unidade!')
            }

            if (_.size(errors)) {
                await toaster.push(<Message showIcon type='warning'><ul>{errors.map((c) => <li>{c}</li>)}</ul></Message>, {placement: 'topEnd', duration: 5000 })
                return
            }

            const result = await new Service().Post('cadastros/produto/salvar', produto)
            
            await toaster.push(<Message showIcon type='success'>Salvo com sucesso!</Message>, {placement: 'topEnd', duration: 5000 })
            
            this.viewModal.current?.close(result.data)

        } catch (error) {
            Exception.error(error)
        } finally {
            this.setState({submting: false})
        }
    }

    close(produto) {
        this.viewModal.current?.close(produto)
    }

    render = () => {
        return (
            <Form autoComplete='off' onSubmit={this.submit}>
                <ViewModal ref={this.viewModal} size={700}>
                    <Modal.Header><Modal.Title><Container>Produto</Container></Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Row gutterWidth={0}>
                            <Col md={3}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='text' value={this.state?.codprod} readOnly />
                                        <span>Código</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={9}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='text' value={this.state?.descricao} onChange={(event) => this.setState({descricao: event.target.value.toUpperCase()})} maxLength={60} />
                                        <span>Nome</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className='form-control'>
                                    <label className="textfield-filled">
                                        <select value={this.state?.unidade} onChange={(event) => this.setState({unidade: event.target.value})} >
                                            <option value="">[Selecione]</option>
                                            {this.state?.unidades?.map((unidade) => <option value={unidade.unidade}>{unidade.unidade} - {unidade.descricao}</option>)}
                                        </select>
                                        <span>Unidade</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className='form-control'>
                                    <label className="textfield-filled">
                                        <input
                                        type="text"
                                        value={Decimal.format(this.state?.custo)}
                                        onChange={(event) => this.setState({custo: Decimal.change(event.target.value)})}
                                        />
                                        <span>Custo</span>
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

export default ViewProduto;