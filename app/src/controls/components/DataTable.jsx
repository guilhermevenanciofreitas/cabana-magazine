import _ from 'lodash';
import React from 'react';
import DataTable from 'react-data-table-component';
import { Loader, Placeholder } from 'rsuite';

//import { Spinner } from '../';

//import './DataTable.css';

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

const ControlDataTable = ({height, dense = true, loading, columns, rows, noDataComponent, style, selectedRows, onItem, OnSort, onSelected, showAways = false, placeholder = 8}) => {

  return (
    <div style={{
      ...style,
      cursor: 'pointer',
      width: '100%',
      marginTop: '15px',
      height: height || '100%', // Defina a altura para 100%
      overflow: loading ? 'hidden' : 'auto',
    }}>

      {loading && <div><Placeholder.Grid rows={30} columns={placeholder} active /></div>}

      {_.size(rows) === 0 && !loading &&
        <>
          <br />
          <span>{noDataComponent ?? 'Nenhum resultado encontrado!'}</span>
        </>
      }

      {((_.size(rows) >= 1 && !loading) || (showAways)) &&
        <div style={{ height: '100%' }}> {/* Garanta que o DataTable ocupe 100% da altura */}
          <DataTable
            fixedHeader
            fixedHeaderScrollHeight='100%' // Garante que a rolagem do cabeçalho seja 100% da altura do contêiner
            sortServer={true}
            columns={columns || []}
            data={rows || []}
            onRowDoubleClicked={onItem}
            dense={dense}
            selectableRows={selectedRows}
            onSort={(column, direction) => {
              if (!column?.sort) return;
              OnSort({ column: column.sort, direction })
            }}
            highlightOnHover
            noHeader={false}
            progressPending={loading}
            onSelectedRowsChange={(args) => onSelected(args.selectedRows)}
            customStyles={customStyles}
            style={{ height: '100%' }} // Faz o DataTable ocupar 100% do contêiner
            pagination={true}
            paginationPerPage={250}
          />
        </div>
      }
    </div>
  )

}

const RowColor = ({children, color, width = '4px', height = '22px'}) => {
  return (
    <div style={{display: 'flex'}}>
      <div style={{backgroundColor: color, width, height}}></div>
      <div style={{marginLeft: '10px'}}>{children}</div>
    </div>
  )
}

ControlDataTable.RowColor = RowColor

export const ComponentDataTable = ControlDataTable;