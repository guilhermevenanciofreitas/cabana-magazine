import React, { forwardRef } from 'react';
import DataTable from 'react-data-table-component';
import { FixedSizeList as List } from 'react-window';

// Componente customizado para renderizar as linhas virtualizadas
const VirtualizedTableBody = forwardRef(({ data, columns, height, rowHeight }, ref) => {
  // Função que renderiza cada linha
  const Row = ({ index, style }) => {
    const row = data[index];
    return (
      <div style={{ ...style, display: 'flex' }} className="rdt_TableRow">
        {columns.map((col, i) => (
          <div key={i} style={{ flex: 1, padding: '0 8px' }} className="rdt_TableCell">
            {col.cell ? col.cell(row) : row[col.selector]}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div ref={ref}>
      <List
        height={height}
        itemCount={data.length}
        itemSize={rowHeight}
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
});

// Componente DataTable que integra o react-window
const VirtualizedDataTable = ({ columns, data, tableHeight = 600, rowHeight = 40, ...rest }) => {
  // Neste exemplo, passamos data vazia para o DataTable, de forma a "desabilitar"
  // a renderização interna das linhas. Em seguida, usamos o prop customTableBody
  // para renderizar nosso componente virtualizado.
  return (
    <DataTable
      columns={columns}
      data={[]} // dados vazios para que a renderização padrão não seja feita
      noHeader
      customStyles={{
        table: {
          style: {
            height: tableHeight, // garante que o container tenha altura definida
          },
        },
      }}
      // Aqui substituímos o corpo da tabela pelo nosso componente virtualizado.
      customTableBody={
        <VirtualizedTableBody
          data={data}
          columns={columns}
          height={tableHeight}
          rowHeight={rowHeight}
        />
      }
      {...rest}
    />
  );
};

export default VirtualizedDataTable;