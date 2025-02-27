import React from 'react'
import { Badge, Button, CheckPicker, Popover, Whisper } from 'rsuite'
import { BiFilter } from 'react-icons/bi'
import _ from 'lodash'

const ControlFilter = ({children}) => {
    return (
        <div style={{width: '350px'}}>
            {children}
        </div>
    )
}

const ControlContainer = ({children}) => {

    const container = React.useRef();
    const content = React.useRef();

    return (
        <div style={{ position: 'relative' }} ref={container}>
            <div ref={content}>
                {children(() => container.current)}
            </div>
        </div>
    )

}

const ControlWhisper = ({children, badge}) => {

    return (
        <Whisper trigger={`click`} placement={`bottomEnd`} speaker={(props, ref) => 
            <Popover ref={ref} className={props.className}>
                {children(props)}
            </Popover>}>
            {badge == 0 ? <Button size={`lg`} appearance={`ghost`} ><BiFilter/></Button> : <Badge color={`blue`} content={badge}><Button size={`lg`} appearance={`primary`}><BiFilter /></Button></Badge>}
        </Whisper>
    )

}

const ControlItem = ({label, data, filter, field, onChange}) => {

    const picker = React.useRef()

    return (
        <>
            <p>{label}</p>
            <ControlContainer>
                {container => (
                    <CheckPicker
                        placeholder={'[Selecione]'}
                        ref={picker}
                        searchable={false}
                        placement={'rightStart'}
                        style={{ position: 'relative', width: '100%' }}
                        container={container}
                        value={filter ? filter[field] : []}
                        onChange={(c) => {
                            if (_.size(c) == 0) {
                                delete filter[field]
                            } else {
                                filter[field] = c
                            }
                            onChange(filter)
                        }}
                        data={data}
                    />
                )}
            </ControlContainer>
        </>
    )

}

ControlFilter.Whisper = ControlWhisper
ControlFilter.Item = ControlItem

export const CustomFilter = ControlFilter