import React from 'react'
import { Modal } from 'rsuite'
import { ViewModal } from '../../controls'

import { Worker, Viewer } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'

import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'

const PdfViewer = ({ base64Pdf }) => {
    
    const defaultLayoutPluginInstance = defaultLayoutPlugin({})

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Worker workerUrl={`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js`}>
                <Viewer fileUrl={base64Pdf} plugins={[defaultLayoutPluginInstance]} />
            </Worker>
        </div>
  )

}

export class ReportViewer extends React.Component {

    viewModal = React.createRef()

    visualize = (pdf) => {
        this.setState({ pdf })
        return this.viewModal.current.show()
    }

    close() {
        this.viewModal.current?.close()
    }

    render() {
        return (
            <ViewModal ref={this.viewModal} size={900}>
                <Modal.Body>
                    <div style={{overflow: 'auto'}}>
                        <PdfViewer base64Pdf={`data:application/pdf;base64,${this.state?.pdf}`} />
                    </div>
                </Modal.Body>
            </ViewModal>
        )
    }
}