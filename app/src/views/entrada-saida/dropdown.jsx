import { useState } from "react";
import { SelectPicker, InputGroup, Input } from "rsuite";

const options = [
  { label: "Parceiro", value: "apple" },
  { label: "Cliente", value: "banana" },
  { label: "Número", value: "cherry" },
  { label: "CPF", value: "cpf" },
  { label: "Cód. barras", value: "codbarra" },
];

export default function ComboBoxWithInput() {
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
