import React from 'react'
import { Badge, Button, HStack, IconButton, List, Message, Nav, Panel, Popover, Stack, toaster, Whisper } from 'rsuite'

import dayjs from 'dayjs'

import PageContent from '../../../components/PageContent'

import { CustomBreadcrumb, CustomPagination, CustomSearch, DataTable } from '../../../controls'
import { FaEdit, FaEllipsisV, FaFileDownload, FaPlusCircle, FaPrint, FaTrash, FaUpload } from 'react-icons/fa'
import { Service } from '../../../service'

import ViewUnidade from './view.unidade'

import _ from 'lodash'
import { times } from 'lodash'
import { Exception } from '../../../utils/exception'
import { Loading } from '../../../App'
import Swal from 'sweetalert2'

const fields = [
  { label: 'Descrição', value: 'descricao' },
]

export class CadastroUnidades extends React.Component {

  ViewUnidade = React.createRef()

  componentDidMount = () => {
    this.onSearch()
  }

  onSearch = () => {
    this.setState({loading: true}, async () => {
      try {
        await new Service().Post('cadastros/unidade/lista', this.state.request).then((result) => this.setState({...result.data})).finally(() => this.setState({loading: false}))
      } catch (error) {
        console.error(error.message)
      }
    })
  }

  onEditarUnidade = async (unidade) => {
    this.ViewUnidade.current.editarUnidade(unidade).then((cte) => {
      if (cte) this.onSearch()
    })
  }

  onNovaUnidade = () => {
    this.ViewUnidade.current.novaUnidade({tipo: 1}).then((cte) => {
      if (cte) this.onSearch()
    })
  }

  onExcluirUnidade = async () => {
    try {
      const r = await Swal.fire({title: 'Tem certeza que deseja excluir ?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sim', cancelButtonText: 'Não'})
      if (!r.isConfirmed) return
      Loading.Show('Excluindo...')
      await new Service().Post('cadastros/unidade/excluir', _.map(this.state?.selecteds, (c) => c.unidade))
      await toaster.push(<Message showIcon type='success'>Excluido com sucesso!</Message>, {placement: 'topEnd', duration: 5000 })
      this.onSearch()
    } catch (error) {
      Exception.error(error)
    } finally {
      Loading.Hide()
    }
  }

  columns = [
    { selector: (row) => row.unidade, name: 'Unidade', minWidth: '100px', maxWidth: '100px'},
    { selector: (row) => row.descricao, name: 'Descrição', minWidth: '280px', maxWidth: '280px'},
  ]

  render = () => {

    return (
      <Panel header={<CustomBreadcrumb menu={'Cadastros'} title={'Unidade'} />}>

        <ViewUnidade ref={this.ViewUnidade} />

        <PageContent>
          
          <Stack spacing={'6px'} direction={'row'} alignItems={'flex-start'} justifyContent={'space-between'}>
            <HStack>
              <CustomSearch loading={this.state?.loading} fields={fields} defaultPicker={'descricao'} value={this.state?.request?.search} onChange={(search) => this.setState({request: {search}}, () => this.onSearch())} />
            </HStack>
          </Stack>

          <hr></hr>
          
          <Nav appearance="subtle">
            <Nav.Item active={!this.state?.request?.bankAccount} onClick={() => this.setState({request: {...this.state.request, bankAccount: undefined}}, () => this.onSearch())}><center style={{width: 140}}>Todos<br></br>{this.state?.loading ? "-" : <>{this.state?.response?.count}</>}</center></Nav.Item>
            {_.map(this.state?.response?.bankAccounts, (bankAccount) => {
              return <Nav.Item eventKey="home" active={this.state?.request?.bankAccount?.id == bankAccount.id} onClick={() => this.setState({request: {...this.state.request, bankAccount: bankAccount}}, () => this.onSearch())}><center style={{width: 160}}>{<><img src={bankAccount?.bank?.image} style={{height: '16px'}} />&nbsp;&nbsp;{bankAccount.name || <>{bankAccount?.agency}-{bankAccount?.agencyDigit} / {bankAccount?.account}-{bankAccount?.accountDigit}</>}</>}<br></br>{this.state?.loading ? '-' : <>R$ {bankAccount.balance}</>}</center></Nav.Item>
            })}
          </Nav>

          <DataTable columns={this.columns} rows={this.state?.response?.rows} loading={this.state?.loading} onItem={(row) => this.onEditarUnidade(row.unidade)} selectedRows={true} onSelected={(selecteds) => this.setState({selecteds})} />
      
          <hr></hr>
          
          <Stack direction='row' alignItems='flexStart' justifyContent='space-between'>
            <Stack spacing={5}>
              <Button appearance='primary' color='blue' startIcon={<FaPlusCircle />} onClick={this.onNovaUnidade}>&nbsp;Novo</Button>
              <Button appearance='primary' color='blue' startIcon={<FaEdit />} disabled={_.size(this.state?.selecteds) != 1} onClick={() => this.onEditarUnidade(this.state?.selecteds[0]?.unidade)}>&nbsp;Editar</Button>
              <Button appearance='primary' color='blue' startIcon={<FaTrash />} disabled={_.size(this.state?.selecteds) == 0} onClick={this.onExcluirUnidade}>&nbsp;Excluir</Button>
            </Stack>
            <CustomPagination isLoading={this.state?.loading} total={this.state?.response?.count} limit={this.state?.request?.limit} activePage={this.state?.request?.offset + 1} onChangePage={(offset) => this.setState({request: {...this.state.request, offset: offset - 1}}, () => this.onSearch())} onChangeLimit={(limit) => this.setState({request: {...this.state.request, limit}}, () => this.onSearch())} />
          </Stack>
          
        </PageContent>
      </Panel>
    )
  }
}