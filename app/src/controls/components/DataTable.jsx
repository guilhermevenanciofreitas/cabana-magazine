import _ from 'lodash';
import React from 'react';
import DataTable from 'react-data-table-component';
import { Loader, Placeholder } from 'rsuite';

//import { Spinner } from '../';

//import './DataTable.css';


const ControlDataTable = ({height, dense = true, loading, columns, rows, noDataComponent, style, selectedRows, onItem, OnSort, onSelected, showAways = false, placeholder = 8}) => {

  return (
    <div style={style || {cursor: 'pointer', width: '100%', marginTop: '15px', maxHeight: '100%', height: height || 'calc(100vh - 370px)', overflow: loading ? 'hidden' : 'auto'}}>

      {loading && <div><Placeholder.Grid rows={30} columns={placeholder} active /></div>}

      {_.size(rows) == 0 && !loading &&
        <>
          <br></br>
          <span>{noDataComponent ?? 'Nenhum resultado encontrato!'}</span>
        </>
      }

      {((_.size(rows) >= 1 && !loading) || (showAways)) &&
      <DataTable
          fixedHeader
          fixedHeaderScrollHeight='100%'
          sortServer={true}
          columns={columns || []}
          data={rows || []}
          onRowDoubleClicked={onItem}
          dense={dense}
          selectableRows={selectedRows}
          onSort={(column, direction) => {
            if (!column?.sort) return;
            OnSort({column: column.sort, direction})
          }}
          highlightOnHover
          noHeader={false}
          progressPending={loading}
          //progressComponent={<Spinner size={null} color='primary' />}
          onSelectedRowsChange={(args) => onSelected(args.selectedRows)}
      />
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