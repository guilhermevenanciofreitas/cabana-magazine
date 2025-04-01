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
    //empresa: {loj_id: 1, loj_nome: "Cabana Do Sapato - Pio XII"},
    request: {
      inicio: dayjs().add(-1, 'day').format('YYYY-MM-DD'),
      final: dayjs().format('YYYY-MM-DD')
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
        this.setState({...result.data })
        
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

      const rows = this.filtrar()

      const items = rows.flatMap(row => 
        row.itens.map(item => ({
            ...item,
            trans_cab: row.trans_cab,
            nome1: row.nome1,
            nome2: row.nome2,
            frete: row.frete,
            dataped: row.dataped,
            parc: row.parc
        }))
      );

      

      const report = await new Service().Post('passo-1/relatorio', {
        items
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

  ExpandedComponent = (row) => {

    const columns = [
      { selector: (row) => row.codprod, name: 'Número', minWidth: '80px', maxWidth: '80px'},
      { selector: (row) => row.codbarra, name: 'Cód.Barras', minWidth: '120px', maxWidth: '120px'},
      { selector: (row) => row.descri1, name: 'Descrição'},
      { selector: (row) => row.fat?.codloja, name: 'Loja', minWidth: '100px', maxWidth: '100px'},
      { selector: (row) => row.tamanho, name: 'Tamanho', minWidth: '100px', maxWidth: '100px'},
      { selector: (row) => row.qtde, name: 'Quantidade', minWidth: '100px', maxWidth: '100px'},
      { selector: (row) => new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.precounit), name: 'Preço Un.', minWidth: '100px', maxWidth: '100px'},
      { selector: (row) => new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.total_item), name: 'Total', minWidth: '100px', maxWidth: '100px'},
    ]
  
    return <DataTable columns={columns} data={row.data.itens} dense customStyles={customStyles} />
  
  }

  columns = [
    { selector: (row) => row.trans_cab, name: 'Número', center: true, minWidth: '80px', maxWidth: '80px'},
    { selector: (row) => row.parc?.parceiro, name: 'Parceiro', minWidth: '140px', maxWidth: '140px'},
    { selector: (row) => dayjs(row.dataped).format('DD/MM/YYYY'), name: 'Data', center: true, minWidth: '90px', maxWidth: '90px'},
    { selector: (row) => dayjs(row.dataped).format('HH:mm'), name: 'Hora', center: true, minWidth: '60px', maxWidth: '60px'},
    { selector: (row) => _.size(row.itens) == 1 ? row.itens[0].fat?.codloja : 'C', name: 'Fat', minWidth: '40px', maxWidth: '40px'},
    //{ selector: (row) => JSON.parse(row.cpf)['3'], name: 'CPF', minWidth: '100px', maxWidth: '100px'},
    { selector: (row) => `${row.nome1} ${row.nome2}`, name: 'Cliente', maxWidth: '250px'},
    { selector: (row) => row.cidade, name: 'Cidade',  minWidth: '160px', maxWidth: '160px'},
    { selector: (row) => row.cep, name: 'CEP',  minWidth: '75px', maxWidth: '75px'},
    { selector: (row) => row.uf, name: 'UF',  minWidth: '130px', maxWidth: '130px'},
    { selector: (row) => _.size(row.itens) == 1 ? row.itens[0].fat?.empresa : '[CONJUGADO]', name: 'Empresa a faturar', minWidth: '250px', maxWidth: '250px'},
    //{ selector: (row) => '0', name: 'loja', minWidth: '200px', maxWidth: '200px'},
  ]

  filtrar = () => {

    let { response, empresa, input, picker, apenasMercadoLivre } = this.state
    let rows = _.cloneDeep(response?.rows || [])
  
    console.log(empresa?.loj_id)

    // Filtra os itens pelo código da loja (se necessário)
    rows = rows
      .map(row => ({
        ...row,
        itens: row.itens.filter(item => !empresa || empresa.loj_id === item.fat?.codloja)
      }))
      .filter(row => row.itens.length > 0) // Remove pedidos sem itens
  
    // Filtra os pedidos de acordo com o input e o picker selecionado
    if (!_.isEmpty(input)) {
      const search = input.toUpperCase()
      rows = rows.filter(item => {
        switch (picker) {
          case "parceiro": return item.parc?.parceiro?.toUpperCase().includes(search)
          case "cliente": return [item.nome1, item.nome2].some(nome => nome?.toUpperCase().includes(search))
          case "trans_cab": return item.trans_cab.toString().includes(input)
          case "cpf": return JSON.parse(item.cpf)["3"].toString().includes(input)
          case "codbarra": return item.codbarra?.toString().includes(input)
          default: return true
        }
      })
    }
  
    // Filtra pedidos do Mercado Livre (ou exclui)
    rows = rows.filter(item => {
      const isMercadoLivre = item.parc?.parceiro?.toUpperCase().includes("MERCADO LIBRE")
      return apenasMercadoLivre ? isMercadoLivre : !isMercadoLivre
    })
  
    return rows

  }  

  render = () => {

    let rows = this.filtrar()

    // Ordenando pelos itens.fat.codloja e trans_cab
    rows = rows.sort((a, b) => {
      const codlojaA = a.itens[0].fat?.codloja;
      const codlojaB = b.itens[0].fat?.codloja;
      if (codlojaA === codlojaB) {
          return a.trans_cab - b.trans_cab; // Se os codloja forem iguais, ordena por trans_cab
      }
      return codlojaA - codlojaB; // Ordena por codloja
    })

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
                  <AutoComplete label='Empresa' value={this.state?.empresa} text={(item) => `${item.loj_nome}`} onChange={(empresa) => this.setState({empresa})} onSearch={async (search) => await Search.empresa(search, this.state?.tipoEntSai?.tipo)}>
                      <AutoComplete.Result>
                          {(item) => <span>{item.loj_nome}</span>}
                      </AutoComplete.Result>
                  </AutoComplete>
              </div>
              <Button appearance="primary" color='blue' onClick={() => this.setState({request: {...this.state?.request, filter: this.state?.request.filter}}, () => this.onSearch())} disabled={this.state?.loading}>{this.state?.loading ? <><Loader /> &nbsp; Buscando...</> : <><FaSearch /> &nbsp; Buscar</>}</Button>
            </Stack>
            
            <div style={{marginTop: '15px', display: 'flex'}}>
              <ComboBoxWithInput onFilterChange={(picker, input) => this.setState({picker, input})} />
              <div style={{marginTop: '10px', marginLeft: '15px'}}>
                <input type="checkbox" id="aceitar" checked={this.state?.apenasMercadoLivre} onChange={(event) => this.setState({apenasMercadoLivre: event.target.checked})} />
                <label for="aceitar" style={{cursor: 'pointer'}}> Apenas MERCADO LIVRE</label>
              </div>
            </div>

          </Stack>

          <hr></hr>
          
          <Nav appearance="subtle">
            <Nav.Item active={!this.state?.request?.bankAccount} onClick={() => this.setState({request: {...this.state.request, bankAccount: undefined}}, () => this.onSearch())}><center style={{width: 140}}>Todos<br></br>{this.state?.loading ? "-" : <>{(_.size(rows) ?? '-')}</>}</center></Nav.Item>
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
                data={rows}
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