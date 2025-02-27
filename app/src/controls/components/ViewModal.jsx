import React from "react";
import { Modal } from "rsuite";

export class ViewModal extends React.Component {

    show = async () => {

        this.setState({open: true});

        return new Promise(resolve => {
            this.close = (value) => {
                this.setState({open: false});
                return resolve(value);
            };
        });

    }

    keydown = (event) => {
        if (event.keyCode == 27) {
            //this.close(null);
        }
    }

    render = () => {
       return (
        <Modal open={this.state?.open ?? false} onClose={() => this.close(undefined)} size={this.props.size} onKeyDown={this.keydown}>
            {this.props.children}
        </Modal>
       )
    }

}