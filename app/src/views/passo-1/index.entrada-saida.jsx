import React, { useState } from 'react'
import { Button, Input, InputGroup, Loader, Message, Nav, Panel, Placeholder, SelectPicker, Stack, toaster } from 'rsuite'

import dayjs from 'dayjs'

import PageContent from '../../components/PageContent'

import { AutoComplete, CustomBreadcrumb } from '../../controls'
import { FaPrint, FaSearch } from 'react-icons/fa'
import { Service } from '../../service'

import _ from 'lodash'
import { Exception } from '../../utils/exception'
import { Search } from '../../search'
import DataTable from 'react-data-table-component'
import { ReportViewer } from '../../controls/components/ReportViewer'
import { Loading } from '../../App'

const customStyles = {
  headRow: {
    style: {
      padding: "0px",  
      margin: "0px",
    },
  },
  headCells: {
    style: {
      padding: "0px",
    },
  },
  rows: {
    style: {
      padding: "0px", // Remove padding das linhas
      margin: "0px",
    },
  },
  cells: {
    style: {
      padding: "0px", // Remove padding das células
    },
  },
};

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


export class Passo1 extends React.Component {

  ReportViewer = React.createRef()

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

        if (_.size(errors) >= 1) {
          toaster.push(<Message type='warning'><b>Mensagem</b><ul style={{marginTop: '10px'}}>{_.map(errors || [], (message, key) => <li key={key}>{message}</li>)}</ul></Message>,{ placement: 'topEnd', duration: 5000 })
          return
        }

        this.setState({loading: true})
        let result = await new Service().Post('passo-1/lista', this.state.request)
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

  relatorio = async () => {
    try {

      this.setState({submting: true})

      Loading.Show('Buscando...')

      const report = await new Service().Post('passo-1/relatorio', {
        items: _.filter(this.state?.response?.rows2, (item) => item.fat?.codloja == this.state?.request?.empresa?.loj_id)
      })

      Loading.Hide()

      await this.ReportViewer.current?.visualize(report.data.pdf)

      Loading.Show('Salvando...')

      await new Service().Post('passo-1/salvar', {
        inicio: this.state?.request?.inicio,
        final: this.state?.request?.final,
        items: _.filter(this.state?.response?.rows2, (item) => item.fat?.codloja == this.state?.request?.empresa?.loj_id)
      })

      await this.onSearch()
      
    } catch (error) {
      Exception.error(error)
    } finally {
      this.setState({submting: false})
      Loading.Hide()
    }
  }

  filtrar = (picker, input) => {

    let rows2 = _.filter(this.state?.response?.rows, (item) => {

      if (_.isEmpty(input)) return true;
  
      switch (picker) {
        case "parceiro": // Parceiro
          return item.parc?.parceiro?.toUpperCase().includes(input.toUpperCase());
        case "cliente": // Cliente
          return item.nome1?.toUpperCase().includes(input.toUpperCase()) || item.nome2?.toUpperCase().includes(input.toUpperCase());
        case "trans_cab": // Número
          return item.trans_cab.toString().includes(input);
        case "cpf": // CPF
          return JSON.parse(item.cpf)["3"].toString().includes(input);
        case "codbarra": // Código de barras
          return item.codbarra?.toString().includes(input);
        default:
          return true;
      }

    })

    console.log(this.state.apenasMercadoLivre)

    if (this.state.apenasMercadoLivre) {
      rows2 = _.filter(rows2, (item) => item.parc?.parceiro?.toUpperCase().includes('MERCADO LIBRE'))
    } else {
      rows2 = _.filter(rows2, (item) => !item.parc?.parceiro?.toUpperCase().includes('MERCADO LIBRE'))
    }
  
    this.setState({ response: { ...this.state.response, rows2 } });
    
  };

  ExpandedComponent = (row) => {

    console.log(row)

    const columns = [
      //{ selector: (row) => <input type="checkbox" checked={row.checked} onChange={() => this.onCheck(row, !row.checked)} />, name: 'Sep.', center: true, minWidth: '40px', maxWidth: '40px'},
      { selector: (row) => row.codprod, name: 'Número', minWidth: '80px', maxWidth: '80px'},
      { selector: (row) => row.codbarra, name: 'Cód.Barras', minWidth: '120px', maxWidth: '120px'},
      { selector: (row) => row.descri1, name: 'Descrição', minWidth: '300px', maxWidth: '300px'},
      { selector: (row) => '', name: 'Loja', minWidth: '100px', maxWidth: '100px'},
      { selector: (row) => row.tamanho, name: 'Tamanho', minWidth: '100px', maxWidth: '100px'},
      { selector: (row) => row.qtde, name: 'Quantidade', minWidth: '100px', maxWidth: '100px'},
      { selector: (row) => new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.precounit), name: 'Preço Un.', minWidth: '100px', maxWidth: '100px'},
      { selector: (row) => new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.total_item), name: 'Total', minWidth: '100px', maxWidth: '100px'},
      { selector: (row) => new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.total_venda), name: 'Total Venda', minWidth: '100px', maxWidth: '100px'},
    ]
  
    return <DataTable columns={columns} data={row.data.items} dense customStyles={customStyles} />
  
  }

  columns = [
    { selector: (row) => row.trans_cab, name: 'Número', center: true, minWidth: '80px', maxWidth: '80px'},
    { selector: (row) => row.parc?.parceiro, name: 'Parceiro', minWidth: '140px', maxWidth: '140px'},
    { selector: (row) => dayjs(row.dataped).format('DD/MM/YYYY'), name: 'Data', center: true, minWidth: '90px', maxWidth: '90px'},
    { selector: (row) => dayjs(row.dataped).format('HH:mm'), name: 'Hora', center: true, minWidth: '60px', maxWidth: '60px'},
    { selector: (row) => row.fat?.codloja, name: 'Fat', minWidth: '30px', maxWidth: '30px'},
    { selector: (row) => JSON.parse(row.cpf)['3'], name: 'CPF', minWidth: '100px', maxWidth: '100px'},
    { selector: (row) => `${row.nome1} ${row.nome2}`, name: 'Cliente', maxWidth: '250px'},
    { selector: (row) => row.cidade, name: 'Cidade',  minWidth: '160px', maxWidth: '160px'},
    { selector: (row) => row.cep, name: 'CEP',  minWidth: '75px', maxWidth: '75px'},
    { selector: (row) => row.uf, name: 'UF',  minWidth: '130px', maxWidth: '130px'},
    { selector: (row) => row.fat?.empresa, name: 'Empresa a faturar', minWidth: '250px', maxWidth: '250px'},
    //{ selector: (row) => '0', name: 'loja', minWidth: '200px', maxWidth: '200px'},
  ]

  render = () => {

    return (
      <Panel header={<CustomBreadcrumb title={'Lista'} />}>

        <ReportViewer ref={this.ReportViewer} />

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

          <div style={{cursor: 'pointer', width: '100%', marginTop: '15px', maxHeight: '100%', height: 'calc(100vh - 400px)', overflow: this.state?.loading ? 'hidden' : 'auto'}}>

            {this.state?.loading && <div><Placeholder.Grid rows={30} columns={8} active /></div>}

            {!this.state?.loading &&
              <DataTable
                fixedHeader
                fixedHeaderScrollHeight='100%'
                dense
                columns={this.columns}
                data={this.state?.response?.rows2 || []}
                expandableRows={true}
                expandableRowsComponent={this.ExpandedComponent}
                customStyles={customStyles}
              />
            }
            
          </div>

          <hr></hr>
          
          <Stack direction='row' alignItems='flexStart' justifyContent='space-between'>
            <Stack spacing={5}>
              <Button appearance="primary" color='blue' onClick={this.relatorio} disabled={this.state?.submting}>{this.state?.submting ? <><Loader /> &nbsp; Imprimindo relação de produtos...</> : <><FaPrint /> &nbsp; Relação de produtos selecionados</>}</Button>
            </Stack>
          </Stack>
          
        </PageContent>
      </Panel>
    )
  }
}