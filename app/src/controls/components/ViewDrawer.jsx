import React from "react";
import { Drawer } from "rsuite";

export class ViewDrawer extends React.Component {

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
        <Drawer open={this.state?.open ?? false} onClose={() => this.close(null)} size={this.props.size} onKeyDown={this.keydown}>
            {this.props.children}
        </Drawer>
       )
    }

}