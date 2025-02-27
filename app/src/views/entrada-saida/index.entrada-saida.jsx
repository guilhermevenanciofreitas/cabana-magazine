import React, { useState } from 'react'
import { Badge, Button, Checkbox, Divider, Drawer, HStack, IconButton, Input, InputGroup, List, Loader, Message, Nav, Panel, Popover, Row, SelectPicker, Stack, toaster, Whisper } from 'rsuite'

import dayjs from 'dayjs'

import PageContent from '../../components/PageContent'

import { AutoComplete, CustomBreadcrumb, CustomPagination, CustomSearch, DataTable } from '../../controls'
import { FaCheck, FaCheckCircle, FaCircle, FaEdit, FaEllipsisV, FaFileDownload, FaFilter, FaPlusCircle, FaPrint, FaSearch, FaTrash, FaUpload } from 'react-icons/fa'
import { Service } from '../../service'

import { ViewEntradaSaida } from './view.entrada-saida'

import _ from 'lodash'
import { Exception } from '../../utils/exception'
import { Search } from '../../search'


const options = [
  { label: "Parceiro", value: "apple" },
  { label: "Cliente", value: "banana" },
  { label: "Número", value: "cherry" },
  { label: "CPF", value: "cpf" },
  { label: "Cód. barras", value: "codbarra" },
];

function ComboBoxWithInput() {
  const [searchText, setSearchText] = useState("");
  const [selectedValue, setSelectedValue] = useState(null);

  // Filtra opções com base no texto digitado
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <InputGroup inside style={{ width: 320 }}>
      {/* Dropdown de seleção à esquerda */}
      <SelectPicker
        appearance="subtle"
        data={filteredOptions}
        searchable={false} // O próprio input faz a busca
        value={selectedValue}
        onChange={setSelectedValue}
        style={{ minWidth: 120, maxWidth: 120 }}
        placement="bottomStart" // Garante que o menu abre corretamente
        cleanable
      />

      {/* Input para busca à direita */}
      <Input
        placeholder="Digite para buscar..."
        value={searchText}
        onChange={setSearchText}
      />
    </InputGroup>
  );
}

export class EntradaSaida extends React.Component {

  ViewEntradaSaida = React.createRef()

  state = {
    request: {
      filter: {apenasMercadoLivre: false, parceiro: ''},
      inicio: dayjs().add(-1, 'day').format('YYYY-MM-DD'),
      final: dayjs().format('YYYY-MM-DD'),
      empresa: {loj_id: 1, loj_nome: "Cabana Do Sapato - Pio XII"}
    }
  }

  onSearch = async () => {
    this.setState({loading: true}, async () => {
      try {
        
        const errors = []

        if (_.isEmpty(this.state?.request?.inicio)) {
          errors.push('Informe a data inicial')
        }

        if (_.isEmpty(this.state?.request?.final)) {
          errors.push('Informe a data final')
        }

        //if (!this.state?.request?.empresa) {
        //  errors.push('Informe a empresa')
        //}

        if (_.size(errors) >= 1) {
          toaster.push(<Message type='warning'><b>Mensagem</b><ul style={{marginTop: '10px'}}>{_.map(errors || [], (message, key) => <li key={key}>{message}</li>)}</ul></Message>,{ placement: 'topEnd', duration: 5000 })
          return
        }

        this.setState({loading: true})
        let result = await new Service().Post('entrada-saida/lista', this.state.request)
        result.data.response['rows2'] = result.data.response['rows']
        this.setState({...result.data })
        
      } catch (error) {
        Exception.error(error)
      } finally {
        this.setState({loading: false})
      }
    })
  }

  onEditar = async (row) => {

    const item = await this.ViewEntradaSaida.current.editar(row)

    if (item) {

      const rows = this.state.response.rows.map(item => item.trans_cab === row.trans_cab ? { ...item, checked: true } : item)

      this.setState({response: {...this.state.response, rows}}, async () => {
        this.onAlteraRegistro(item, item.codcaixa, item.obs)
      })

    }

  }

  onAlteraRegistro = (row, codcaixa, obs) => {
    const rows2 = this.state.response.rows2.map((item) => item.trans_cab === row.trans_cab ? { ...item, codcaixa, obs } : item)
    this.setState({response: {...this.state.response, rows2}})
  }

  onCheck = async (row, checked) => {

    const rows2 = this.state.response.rows2.map(item => item.trans_cab === row.trans_cab ? { ...item, checked } : item)

    this.setState({response: {...this.state.response, rows2}}, async () => {
      
      let codcaixa, obs = ''

      if (checked) {
        const item = await this.onEditar(row)
        codcaixa = item.codcaixa || ''
        obs = item.obs || ''
      }

      this.onAlteraRegistro(row, codcaixa, obs)

    })

  }

  salvar = async () => {
    try {

      const selecteds = _.filter(this.state?.response?.rows2, (item) => item.checked)

      this.setState({submting: true})

      await new Service().Post('entrada-saida/salvar', _.map(selecteds, (item) => {
        return {
          numero: item.trans_cab,
          codprod: item.codprod,
          codprod1: item.codprod1,
          codcaixa: item.codcaixa,
          obs: item.obs
        }
      }))

      await toaster.push(<Message showIcon type='success'>Salvo com sucesso!</Message>, {placement: 'topEnd', duration: 5000 })
      
      this.onSearch()
      
    } catch (error) {
      Exception.error(error)
    } finally {
      this.setState({submting: false})
    }
  }

  /*
  filtrar = ({picker, input}) => {

    const rows2 = _.filter(this.state?.response?.rows, (item) => {

      if (_.isEmpty(input)) return true

      if (picker == 'parceiro') return item.parc?.parceiro?.toUpperCase().includes(input.toUpperCase())
      if (picker == 'cliente') return item.nome1?.toUpperCase().includes(input.toUpperCase()) || item.nome2?.toUpperCase().includes(input.toUpperCase())
      if (picker == 'numero') return item.trans_cab.toString().includes(input)
      if (picker == 'cpf') return JSON.parse(item.cpf)['3'].toString().includes(input)
      if (picker == 'codbarras') return item.codbarra?.toString().includes(input)

    })

    this.setState({response: {...this.state.response, rows2 }})

  }
  */

  columns = [
    { selector: (row) => <input type="checkbox" checked={row.checked} onChange={() => this.onCheck(row, !row.checked)} />, name: 'Sep.', center: true, minWidth: '30px', maxWidth: '30px'},
    { selector: (row) => row.trans_cab, name: 'Número', center: true, minWidth: '80px', maxWidth: '80px'},
    { selector: (row) => row.parc?.parceiro, name: 'Parceiro', minWidth: '140px', maxWidth: '140px'},
    { selector: (row) => dayjs(row.dataped).format('DD/MM/YYYY'), name: 'Data', center: true, minWidth: '90px', maxWidth: '90px'},
    { selector: (row) => dayjs(row.dataped).format('HH:mm'), name: 'Hora', center: true, minWidth: '60px', maxWidth: '60px'},
    { selector: (row) => `${row.nome1} ${row.nome2}`, name: 'Cliente', maxWidth: '250px'},
    { selector: (row) => row.codprod, name: 'Cód. prod', center: true,  minWidth: '75px', maxWidth: '75px'},
    { selector: (row) => row.codbarra, name: 'Cod. barras', center: true, minWidth: '130px', maxWidth: '130px'},
    { selector: (row) => row.descricao, name: 'Descrição'},
    { selector: (row) => row.tamanho, name: 'Tamanho', center: true, minWidth: '90px', maxWidth: '90px'},
    { selector: (row) => row.qtde, name: 'Qtde', center: true, minWidth: '55px', maxWidth: '55px'},
    { selector: (row) => row.codloja, name: 'Loja', center: true, minWidth: '55px', maxWidth: '55px'},
    { selector: (row) => row.codcaixa, name: 'Cod. caixa', center: true, minWidth: '70px', maxWidth: '70px'},
    { selector: (row) => JSON.parse(row.cpf)['3'], name: 'CPF', minWidth: '110px', maxWidth: '110px'},
    { selector: (row) => row.obs, name: 'Obs', minWidth: '150px', maxWidth: '150px'},
    { selector: (row) => row.estoq, name: 'Gaveta', minWidth: '50px', maxWidth: '50px'},
  ]

  render = () => {

    return (
      <Panel header={<CustomBreadcrumb title={'Movimentação'} />}>

        <ViewEntradaSaida ref={this.ViewEntradaSaida} />

        <PageContent>
          
          <Stack direction='row' alignItems='flexStart' justifyContent='space-between'>
            <Stack spacing={0}>
              <div className='form-control'>
                  <label class="textfield-filled">
                      <input type='date' value={this.state?.request?.inicio} onChange={(event) => this.setState({request: {...this.state?.request, inicio: event.target.value}})} />
                      <span>Inicio</span>
                  </label>
              </div>
              <div className='form-control'>
                  <label class="textfield-filled">
                      <input type='date' value={this.state?.request?.final} onChange={(event) => this.setState({request: {...this.state?.request, final: event.target.value}})} />
                      <span>Final</span>
                  </label>
              </div>
              <div className='form-control' style={{width: '300px'}}>
                  <AutoComplete label='Empresa' value={this.state?.request.empresa} text={(item) => `${item.loj_nome}`} onChange={(empresa) => this.setState({request: {...this.state?.request, empresa}})} onSearch={async (search) => await Search.empresa(search, this.state?.tipoEntSai?.tipo)}>
                      <AutoComplete.Result>
                          {(item) => <span>{item.loj_nome}</span>}
                      </AutoComplete.Result>
                  </AutoComplete>
              </div>
              <Button appearance="primary" color='blue' onClick={() => this.setState({request: {...this.state?.request, filter: this.state?.request.filter}}, () => this.onSearch())} disabled={this.state?.loading}>{this.state?.loading ? <><Loader /> &nbsp; Pesquisando...</> : <><FaSearch /> &nbsp; Pesquisar</>}</Button>
            </Stack>
            
            <div style={{marginTop: '15px', display: 'flex'}}>
              <ComboBoxWithInput />
              <Checkbox>Apenas MERCADO LIVRE</Checkbox>
              {/*<Filter filter={this.state?.request?.filter} onChange={(filter) => this.setState({request: {...this.state.request, filter}}, () => this.onSearch())} />*/}
            </div>

          </Stack>

          <hr></hr>
          
          <Nav appearance="subtle">
            <Nav.Item active={!this.state?.request?.bankAccount} onClick={() => this.setState({request: {...this.state.request, bankAccount: undefined}}, () => this.onSearch())}><center style={{width: 140}}>Todos<br></br>{this.state?.loading ? "-" : <>{(_.size(this.state?.response?.rows2) ?? '-')}</>}</center></Nav.Item>
            {_.map(this.state?.response?.bankAccounts, (bankAccount) => {
              return <Nav.Item eventKey="home" active={this.state?.request?.bankAccount?.id == bankAccount.id} onClick={() => this.setState({request: {...this.state.request, bankAccount: bankAccount}}, () => this.onSearch())}><center style={{width: 160}}>{<><img src={bankAccount?.bank?.image} style={{height: '16px'}} />&nbsp;&nbsp;{bankAccount.name || <>{bankAccount?.agency}-{bankAccount?.agencyDigit} / {bankAccount?.account}-{bankAccount?.accountDigit}</>}</>}<br></br>{this.state?.loading ? '-' : <>R$ {bankAccount.balance}</>}</center></Nav.Item>
            })}
          </Nav>

          <DataTable height={'calc(100vh - 400px)'} noDataComponent={''} columns={this.columns} rows={this.state?.response?.rows2} loading={this.state?.loading} onItem={(row) => this.onEditar(row)} />
      
          <hr></hr>
          
          <Stack direction='row' alignItems='flexStart' justifyContent='space-between'>
            <Stack spacing={5}>
              <Button appearance="primary" color='blue' onClick={this.salvar} disabled={this.state?.submting}>{this.state?.submting ? <><Loader /> &nbsp; Salvando...</> : <><FaCheckCircle /> &nbsp; Salvar marcados</>}</Button>
            </Stack>
          </Stack>
          
        </PageContent>
      </Panel>
    )
  }
}