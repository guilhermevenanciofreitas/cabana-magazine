import React from "react"
import { Button, Form, Loader, Message, Modal, toaster } from 'rsuite'
import { Container, Row, Col } from 'react-grid-system'
import { ViewModal } from "../../controls"
import { MdCheckCircleOutline } from "react-icons/md"
import { Service } from "../../service"
import _ from "lodash"

export class ViewUpload extends React.Component {

    viewModal = React.createRef()

    upload = async (ctes) => {
        if (this.state) for (const prop of Object.getOwnPropertyNames(this.state)) delete this.state[prop]
        this.setState({...ctes})
        return this.viewModal.current.show()
    }

    submit = async () => {
        this.setState({submting: true}, async () => {

            let formData = new FormData()

            const files = this.state?.files

            for (let i = 0; i < files.length; i++) {
                formData.append("files", files[i])
            }

            await new Service().Post('passo-4/upload', formData, {'Content-Type': 'multipart/form-data'}).then(async (result) => {
                await toaster.push(<Message showIcon type='success'>Salvo com sucesso!</Message>, {placement: 'topEnd', duration: 5000 })
                this.viewModal.current?.close(result.data)
            }).finally(() => this.setState({submting: false}))

        })
    }

    close(role) {
        this.viewModal.current?.close(role)
    }

    render = () => {
        
        return (
            <Form autoComplete='off' onSubmit={this.submit}>
                <ViewModal ref={this.viewModal} size={600}>
                    <Modal.Header><Modal.Title><Container>Upload</Container></Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Row gutterWidth={0}>
                            <Col md={12}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='file' onChange={(event) => this.setState({files: event.target.files})} accept=".pdf,.xml" multiple />
                                        <span>Arquivo XML</span>
                                    </label>
                                </div>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button appearance="primary" color='green' onClick={this.submit} disabled={this.state?.submting}>{this.state?.submting ? <><Loader /> &nbsp; Confirmando...</> : <><MdCheckCircleOutline /> &nbsp; Confirmar</>}</Button>
                    </Modal.Footer>
                </ViewModal>
            </Form>
        )

    }

}