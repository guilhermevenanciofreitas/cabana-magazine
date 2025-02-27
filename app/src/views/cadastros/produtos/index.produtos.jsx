import React from 'react'
import { Badge, Button, HStack, IconButton, List, Message, Nav, Panel, Popover, Stack, toaster, Whisper } from 'rsuite'

import dayjs from 'dayjs'

import PageContent from '../../../components/PageContent'

import { CustomBreadcrumb, CustomPagination, CustomSearch, DataTable } from '../../../controls'
import { FaEdit, FaEllipsisV, FaFileDownload, FaPlusCircle, FaPrint, FaTrash, FaUpload } from 'react-icons/fa'
import { Service } from '../../../service'

import ViewProduto from './view.produto'

import _ from 'lodash'
import { times } from 'lodash'
import { Exception } from '../../../utils/exception'
import Swal from 'sweetalert2'
import { Loading } from '../../../App'
import { ReportViewer } from '../../../controls/components/ReportViewer'

const fields = [
  { label: 'Descrição', value: 'descricao' },
]

export class CadastroProdutos extends React.Component {

  ViewProduto = React.createRef()
  ReportViewer = React.createRef()

  componentDidMount = () => {
    this.onSearch()
  }

  onSearch = () => {
    this.setState({loading: true}, async () => {
      try {
        
        const result = await new Service().Post('cadastros/produto/lista', this.state.request)
        this.setState({...result.data})
        
      } catch (error) {
        Exception.error(error)
      } finally {
        this.setState({loading: false})
      }
    })
  }

  onEditaProduto = async (codprod) => {
    this.ViewProduto.current.editaProduto(codprod).then((produto) => {
      if (produto) this.onSearch()
    })
  }

  onNovoProduto = () => {
    this.ViewProduto.current.novoProduto().then((produto) => {
      if (produto) this.onSearch()
    })
  }

  onExcluirProduto = async () => {
    try {
      const r = await Swal.fire({title: 'Tem certeza que deseja excluir ?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sim', cancelButtonText: 'Não'})
      if (!r.isConfirmed) return
      Loading.Show('Excluindo...')
      await new Service().Post('cadastros/produto/excluir', _.map(this.state?.selecteds, (c) => c.codprod))
      await toaster.push(<Message showIcon type='success'>Excluido com sucesso!</Message>, {placement: 'topEnd', duration: 5000 })
      this.onSearch()
    } catch (error) {
      Exception.error(error)
    } finally {
      Loading.Hide()
    }
  }

  onImprimir = async () => {
    try {

      Loading.Show('Imprimindo...')

      const report = await new Service().Post('cadastros/produto/imprimir')

      this.ReportViewer.current?.visualize(report.data.pdf)

    } catch (error) {
      Exception.error(error)
    } finally {
      Loading.Hide()
    }
  }

  columns = [
    { selector: (row) => row.codprod, name: 'Código', maxWidth: '100px'},
    { selector: (row) => row.descricao, name: 'Descrição', maxWidth: '280px'},
    { selector: (row) => row.unidade, name: 'Unid', maxWidth: '80px'},
    { selector: (row) => new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.custo), name: 'Custo', maxWidth: '100px', right: true},
    { selector: (row) => new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.customed), name: 'Custo médio', maxWidth: '100px', right: true},
    { selector: (row) => new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.ultcomp), name: 'Vlr.ult.compra', maxWidth: '110px', right: true},
  ]

  render = () => {

    return (
      <Panel header={<CustomBreadcrumb menu={'Cadastros'} title={'Produtos'} />}>

        <ViewProduto ref={this.ViewProduto} />
        <ReportViewer ref={this.ReportViewer} />

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

          <DataTable columns={this.columns} rows={this.state?.response?.rows} loading={this.state?.loading} onItem={(row) => this.onEditaProduto(row.codprod)} selectedRows={true} onSelected={(selecteds) => this.setState({selecteds})} />
      
          <hr></hr>
          
          <Stack direction='row' alignItems='flexStart' justifyContent='space-between'>
            <Stack spacing={5}>
              <Button appearance='primary' color='blue' startIcon={<FaPlusCircle />} onClick={this.onNovoProduto}>&nbsp;Novo</Button>
              <Button appearance='primary' color='blue' startIcon={<FaEdit />} disabled={_.size(this.state?.selecteds) != 1} onClick={() => this.onEditaProduto(this.state?.selecteds[0]?.codprod)}>&nbsp;Editar</Button>
              <Button appearance='primary' color='blue' startIcon={<FaTrash />} disabled={_.size(this.state?.selecteds) == 0} onClick={this.onExcluirProduto}>&nbsp;Excluir</Button>
              <Button appearance='primary' color='blue' startIcon={<FaPrint />} onClick={this.onImprimir}>&nbsp;Imprimir</Button>
            </Stack>
            <CustomPagination isLoading={this.state?.loading} total={this.state?.response?.count} limit={this.state?.request?.limit} activePage={this.state?.request?.offset + 1} onChangePage={(offset) => this.setState({request: {...this.state.request, offset: offset - 1}}, () => this.onSearch())} onChangeLimit={(limit) => this.setState({request: {...this.state.request, limit}}, () => this.onSearch())} />
          </Stack>
          
        </PageContent>
      </Panel>
    )
  }
}