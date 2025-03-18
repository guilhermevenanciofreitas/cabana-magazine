import React, { useState } from 'react'
import { Badge, Button, Input, InputGroup, Loader, Message, Nav, Panel, SelectPicker, Stack, toaster } from 'rsuite'

import dayjs from 'dayjs'

import PageContent from '../../components/PageContent'

import { AutoComplete, CustomBreadcrumb, DataTable } from '../../controls'
import { FaArchive, FaCheckCircle, FaPrint, FaSearch } from 'react-icons/fa'
import { Service } from '../../service'

import _ from 'lodash'
import { Exception } from '../../utils/exception'
import { Search } from '../../search'
import { Loading } from '../../App'

import { ViewUpload } from './view.upload'
import { ReportViewer } from '../../controls/components/ReportViewer'
import Swal from 'sweetalert2'

const options = [
  { label: "Parceiro", value: "parceiro" },
  { label: "Cliente", value: "cliente" },
  { label: "Número", value: "trans_cab" },
  { label: "CPF", value: "cpf" },
  { label: "Cód. barras", value: "codbarra" },
];

function ComboBoxWithInput({ onFilterChange }) {
  const [searchText, setSearchText] = useState("");
  const [selectedValue, setSelectedValue] = useState(null);

  // Chama a função de filtro sempre que o dropdown ou input mudar
  const handleFilterChange = (newSelectedValue, newSearchText) => {
    setSelectedValue(newSelectedValue);
    setSearchText(newSearchText);
    onFilterChange(newSelectedValue, newSearchText);
  };

  return (
    <InputGroup inside style={{ width: 320 }}>
      {/* Dropdown de seleção à esquerda */}
      <SelectPicker
        appearance="subtle"
        data={options}
        searchable={false}
        value={selectedValue}
        onChange={(value) => handleFilterChange(value, searchText)}
        style={{ minWidth: 120, maxWidth: 120 }}
        placement="bottomStart"
        cleanable
      />

      {/* Input de busca à direita */}
      <Input
        placeholder="Digite para buscar..."
        value={searchText}
        onChange={(value) => handleFilterChange(selectedValue, value)}
      />
    </InputGroup>
  );
}


export class Passo4 extends React.Component {

  viewUpload = React.createRef()
  
  reportViewer = React.createRef()

  state = {
    request: {
      inicio: dayjs().add(-1, 'day').format('YYYY-MM-DD'),
      final: dayjs().format('YYYY-MM-DD'),
      empresa: {loj_id: 1, loj_nome: "Cabana Do Sapato - Pio XII"}
    }
  }

  onSearch = async () => {
    this.setState({loading: true}, async () => {
      try {

        Loading.Show('Buscando...')
        
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
        let result = await new Service().Post('passo-4/lista', this.state.request)
        result.data.response['rows2'] = result.data.response['rows']
        this.setState({...result.data }, () => this.filtrar())
        
      } catch (error) {
        Exception.error(error)
      } finally {
        Loading.Hide()
        this.setState({loading: false})
      }
    })
  }

  
  filtrar = (picker, input) => {

    let rows2 = _.filter(this.state?.response?.rows, (item) => {

      if (_.isEmpty(input)) return true;
  
      switch (picker) {
        case "parceiro": // Parceiro
          return item.parc?.parceiro?.toUpperCase().includes(input.toUpperCase())
        case "cliente": // Cliente
          return item.nome1?.toUpperCase().includes(input.toUpperCase()) || item.nome2?.toUpperCase().includes(input.toUpperCase())
        case "trans_cab": // Número
          return item.trans_cab.toString().includes(input)
        case "cpf": // CPF
          return JSON.parse(item.cpf)["3"].toString().includes(input)
        case "codbarra": // Código de barras
          return item.codbarra?.toString().includes(input)
        default:
          return true
      }

    })

    if (this.state.apenasMercadoLivre) {
      rows2 = _.filter(rows2, (item) => item.parc?.parceiro?.toUpperCase().includes('MERCADO LIBRE'))
    } else {
      rows2 = _.filter(rows2, (item) => !item.parc?.parceiro?.toUpperCase().includes('MERCADO LIBRE'))
    }
  
    this.setState({ response: { ...this.state.response, rows2 } })
    
  }

  onAlteraRegistro = (row) => {
    const rows2 = this.state.response.rows2.map((item) => item.trans_cab === row.trans_cab ? { ...item } : item)
    this.setState({response: {...this.state.response, rows2}})
  }

  onCheck = async (row, checked) => {

    const rows2 = this.state.response.rows2.map(item => item.trans_cab === row.trans_cab ? { ...item, checked } : item)

    this.setState({response: {...this.state.response, rows2}}, async () => {
      
      this.onAlteraRegistro(row)

    })

  }

  salvar = async () => {
    try {

      const selecteds = _.filter(this.state?.response?.rows2, (item) => item.checked)

      this.setState({submting: true})

      await new Service().Post('passo-4/salvar', _.map(selecteds, (item) => {
        return {
          numero: item.trans_cab,
          codprod: item.codprod,
          codprod1: item.codprod1
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

  uploadDanfe = async () => {
    await this.viewUpload.current.upload({file: 'danfe'})
  }

  uploadEtiqueta = async () => {
    await this.viewUpload.current.upload({file: 'etiqueta'})
  }

  danfe = async (cpf) => {
    try {

      Loading.Show()
      const response = await new Service().Post('passo-4/danfe', {cpf})
      Loading.Hide()

      if (response.status == 201) {
        await Swal.fire({title: '', text: response.data.message, icon: 'warning', confirmButtonText: 'OK'})
        return
      }

      this.reportViewer.current.visualize(response.data.pdf)

    } catch (error) {
      Exception.error(error)
    } finally {
      Loading.Hide()
    }
  }

  etiqueta = async (etiqueta) => {
    try {

      Loading.Show()
      const response = await new Service().Post('passo-4/etiqueta', {etiqueta})
      Loading.Hide()

      if (response.status == 201) {
        await Swal.fire({title: '', text: response.data.message, icon: 'warning', confirmButtonText: 'OK'})
        return
      }

      this.reportViewer.current.visualize(response.data.pdf)

    } catch (error) {
      Exception.error(error)
    } finally {
      Loading.Hide()
    }
  }

  columns = [
    { selector: (row) => <input type="checkbox" checked={row.checked} onChange={() => this.onCheck(row, !row.checked)} />, name: 'Sep.', center: true, minWidth: '30px', maxWidth: '30px'},
    { selector: (row) => row.trans_cab, name: 'Número', center: true, minWidth: '80px', maxWidth: '80px'},
    { selector: (row) => dayjs(row.dataped).format('DD/MM/YYYY'), name: 'Data', center: true, minWidth: '90px', maxWidth: '90px'},
    { selector: (row) => dayjs(row.dataped).format('HH:mm'), name: 'Hora', center: true, minWidth: '60px', maxWidth: '60px'},
    { selector: (row) => `${row.nome1} ${row.nome2}`, name: 'Cliente', minWidth: '150px', maxWidth: '150px'},
    { selector: (row) => row.codprod, name: 'Cód. prod', center: true,  minWidth: '75px', maxWidth: '75px'},
    { selector: (row) => row.codbarra, name: 'Cod. barras', center: true, minWidth: '130px', maxWidth: '130px'},
    { selector: (row) => row.descricao, name: 'Descrição'},
    { selector: (row) => row.tamanho, name: 'Tamanho', center: true, minWidth: '90px', maxWidth: '90px'},
    { selector: (row) => row.qtde, name: 'Qtde', center: true, minWidth: '55px', maxWidth: '55px'},
    { selector: (row) => <FaPrint size='16px' color='tomato' style={{padding: '3px'}} onClick={() => this.etiqueta(row.nome1 + ' ' + row.nome2)} />, name: 'Etiq.', center: true, minWidth: '50px', maxWidth: '50px', style: {padding: '0px'}},
    { selector: (row) => <FaPrint size='16px' color='tomato' style={{padding: '3px'}} onClick={() => this.danfe(JSON.parse(row.cpf)['3'])} />, name: 'Danfe', center: true, minWidth: '50px', maxWidth: '50px', style: {padding: '0px'}},
    { selector: (row) => row.codloja, name: 'Loja', center: true, minWidth: '55px', maxWidth: '55px'},
    { selector: (row) => row.parc?.parceiro, name: 'Parceiro', minWidth: '140px', maxWidth: '140px'},
    { selector: (row) => row.precounit, name: 'Preço Unit.', minWidth: '80px', maxWidth: '80px'},
    { selector: (row) => row.codcaixa, name: 'Cod. caixa', center: true, minWidth: '70px', maxWidth: '70px'},
    { selector: (row) => '', name: 'Caminho etiq.', minWidth: '100px', maxWidth: '100px'},
    { selector: (row) => '', name: 'Caminho danfe.', minWidth: '100px', maxWidth: '100px'},
  ]

  render = () => {

    return (
      <Panel header={<CustomBreadcrumb title={'Expedição'} />}>

      <ViewUpload ref={this.viewUpload} />
      
      <ReportViewer ref={this.reportViewer} />

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
                  <AutoComplete label='Empresa' value={this.state?.request?.empresa} text={(item) => `${item.loj_nome}`} onChange={(empresa) => this.setState({request: {...this.state?.request, empresa}})} onSearch={async (search) => await Search.empresa(search, this.state?.tipoEntSai?.tipo)}>
                      <AutoComplete.Result>
                          {(item) => <span>{item.loj_nome}</span>}
                      </AutoComplete.Result>
                  </AutoComplete>
              </div>
              <Button appearance="primary" color='blue' onClick={() => this.setState({request: {...this.state?.request, filter: this.state?.request.filter}}, () => this.onSearch())} disabled={this.state?.loading}>{this.state?.loading ? <><Loader /> &nbsp; Buscando...</> : <><FaSearch /> &nbsp; Buscar</>}</Button>
            </Stack>
            
            <div style={{marginTop: '15px', display: 'flex'}}>
              <ComboBoxWithInput onFilterChange={this.filtrar} />
              <div style={{marginTop: '10px', marginLeft: '15px'}}>
                <input type="checkbox" id="aceitar" checked={this.state?.apenasMercadoLivre} onChange={(event) => this.setState({apenasMercadoLivre: event.target.checked}, () => this.filtrar())} />
                <label for="aceitar" style={{cursor: 'pointer'}}> Apenas MERCADO LIVRE</label>
              </div>
            </div>

          </Stack>

          <hr></hr>
          
          <Nav appearance="subtle">
            <Nav.Item active={!this.state?.request?.bankAccount} onClick={() => this.setState({request: {...this.state.request, bankAccount: undefined}}, () => this.onSearch())}><center style={{width: 140}}>Todos<br></br>{this.state?.loading ? "-" : <>{(_.size(this.state?.response?.rows2) ?? '-')}</>}</center></Nav.Item>
            {_.map(this.state?.response?.bankAccounts, (bankAccount) => {
              return <Nav.Item eventKey="home" active={this.state?.request?.bankAccount?.id == bankAccount.id} onClick={() => this.setState({request: {...this.state.request, bankAccount: bankAccount}}, () => this.onSearch())}><center style={{width: 160}}>{<><img src={bankAccount?.bank?.image} style={{height: '16px'}} />&nbsp;&nbsp;{bankAccount.name || <>{bankAccount?.agency}-{bankAccount?.agencyDigit} / {bankAccount?.account}-{bankAccount?.accountDigit}</>}</>}<br></br>{this.state?.loading ? '-' : <>R$ {bankAccount.balance}</>}</center></Nav.Item>
            })}
          </Nav>

          <DataTable height={'calc(100vh - 400px)'} noDataComponent={''} columns={this.columns} rows={this.state?.response?.rows2} loading={this.state?.loading} />
      
          <hr></hr>
          
          <Stack direction='row' alignItems='flexStart' justifyContent='space-between'>
            <Stack spacing={5}>
              <Button appearance="primary" color='blue' onClick={this.salvar} disabled={this.state?.submting}>{this.state?.submting ? <><Loader /> &nbsp; Salvando...</> : <><FaCheckCircle /> &nbsp; Salvar</>}</Button>
              <Button appearance="primary" color='blue' onClick={this.uploadDanfe} disabled={this.state?.submting}>{this.state?.submting ? <><Loader /> &nbsp; Arquivando...</> : <><FaArchive /> &nbsp; Arquivos DANFE</>}</Button>
              <Button appearance="primary" color='blue' onClick={this.uploadEtiqueta} disabled={this.state?.submting}>{this.state?.submting ? <><Loader /> &nbsp; Arquivando...</> : <><FaArchive /> &nbsp; Arquivos Etiqueta</>}</Button>
            </Stack>
          </Stack>
          
        </PageContent>
      </Panel>
    )

  }

}