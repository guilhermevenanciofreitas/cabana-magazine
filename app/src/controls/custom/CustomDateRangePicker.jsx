import React from 'react'
import { DateRangePicker } from 'rsuite'
import { addDays, endOfWeek, startOfWeek, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import _ from 'lodash'

const predefinedRanges = [
    {
        label: 'Hoje',
        value: [new Date(), new Date()],
        placement: 'left'
    },
    {
        label: 'Ontem',
        value: [addDays(new Date(), -1), addDays(new Date(), -1)],
        placement: 'left'
    },
    {
        label: 'Últimos 7 dias',
        value: [addDays(new Date(), -7), new Date()],
        placement: 'left'
    },
    {
        label: 'Últimos 30 dias',
        value: [addDays(new Date(), -30), new Date()],
        placement: 'left'
    },
  
    {
      label: 'Semana passada',
      closeOverlay: false,
      value: value => {
        const [start = new Date()] = value || [];
        return [
          addDays(startOfWeek(start, { weekStartsOn: 0 }), -7),
          addDays(endOfWeek(start, { weekStartsOn: 0 }), -7)
        ];
      },
      appearance: 'default'
    },
    {
      label: 'Próxima semana',
      closeOverlay: false,
      value: value => {
        const [start = new Date()] = value || [];
        return [
          addDays(startOfWeek(start, { weekStartsOn: 0 }), 7),
          addDays(endOfWeek(start, { weekStartsOn: 0 }), 7)
        ];
      },
      appearance: 'default'
    }
]
  
const ControlDateRangePicker = ({value, onChange}) => {

    return (
        <DateRangePicker placement='bottomStart' value={value} renderValue={([start, end]) => format(start, 'dd/MM/yyyy', { locale: ptBR}) + ' - ' + format(end, 'dd/MM/yyyy')} appearance={'default'} placeholder={'Vencimento'} ranges={predefinedRanges} style={{width: '230px'}} onChange={onChange} />
    )
}

export const CustomDateRangePicker = ControlDateRangePicker