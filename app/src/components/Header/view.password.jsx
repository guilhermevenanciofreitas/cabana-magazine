import React from "react";
import { Button, Col, Divider, Form, Grid, Input, InputGroup, Loader, Message, Modal, Row, toaster } from 'rsuite';
import { ViewModal } from "../../controls";
import { BiTrendingUp } from "react-icons/bi";

import EyeCloseIcon from '@rsuite/icons/EyeClose';
import VisibleIcon from '@rsuite/icons/Visible';
import { MdCheckCircleOutline } from "react-icons/md";
import { Service } from "../../service";
import _ from "lodash";

const initialValues = {
    saving: false,
    canceling: false,
    finishing: false,
    data: {
        id: '',
        travelId: '',
    }
}

class ViewPassword extends React.Component {

    viewModal = React.createRef();

    change = async (id) => {
        this.setState({id}, () => {
            return this.viewModal.current?.show()
        })
    }

    submit = async () => {
        this.setState({submiting: true}, async () => {
            await new Service().Post('setting/user/change-password', {
                ..._.pick(this.state, ['password', 'newPassword', 'confirmPassword'])
            }).then(async (result) => {

                if(result.status == 201) {
                    await toaster.push(<Message showIcon type='warning'>{result.data.message}</Message>, {placement: 'topEnd', duration: 5000 })
                    return
                }

                await toaster.push(<Message showIcon type='success'>{result.data.message}</Message>, {placement: 'topEnd', duration: 5000 })

                this.close()

            }).finally(() => this.setState({submiting: false}));
        })
    }

    close = (value) => {
        this.viewModal.current?.close(value);
    }

    onShowPassword = () => {
        this.setState({visible: !this.state?.visible})
    }

    render = () => {
        
        return (
            <ViewModal ref={this.viewModal} size={400}>
                <Modal.Header><Modal.Title>Alterar senha</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Grid fluid>
                        <Col md={24}>
                            <Form.Group className="form-control">
                                <label>Senha</label>
                                <InputGroup inside>
                                    <Input type={this.state?.visible ? 'text' : 'password'} value={this.state?.password} onChange={(password) => this.setState({password})} />
                                    <InputGroup.Button onClick={this.onShowPassword}>
                                        {this.state?.visible ? <VisibleIcon /> : <EyeCloseIcon />}
                                    </InputGroup.Button>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <br></br>
                        <Divider />
                        <br></br>
                        <Col md={24}>
                            <Form.Group className="form-control">
                                <label>Nova senha</label>
                                <Input type='password' value={this.state?.newPassword} onChange={(newPassword) => this.setState({newPassword})} />
                            </Form.Group>
                        </Col>
                        <Col md={24}>
                            <Form.Group className="form-control">
                                <label>Confirmar</label>
                                <Input type='password' value={this.state?.confirmPassword} onChange={(confirmPassword) => this.setState({confirmPassword})} />
                            </Form.Group>
                        </Col>
                    </Grid>
                </Modal.Body>
                <Modal.Footer>
                    <Button appearance="primary" type='submit' color='green' disabled={this.state?.submiting} onClick={this.submit}>{this.state?.submiting ? <><Loader />&nbsp;&nbsp; Confirmando...</> : <><MdCheckCircleOutline />&nbsp;&nbsp; Confirmar</>}</Button>
                </Modal.Footer>
            </ViewModal>
        )

    }

}

export default ViewPassword;