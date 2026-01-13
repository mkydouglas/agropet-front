export interface CadastrarCompraCommand {
    numeroNotaFiscal: string | null;
    fornecedor: FornecedorDTO;
    itensComprados: ItensComprados[];
}

export interface FornecedorDTO {
    id: number | null;
    cnpj: string;
    nomeFantasia: string;
    razaoSocial: string | null;
    telefone: string | null;
}

export interface ItensComprados {
    produto: ProdutoDTO;
    quantidade: number;
    precoUnitarioCompra: number;
    lote: LoteDTO | null;
}

export interface ProdutoDTO {
    id: number | null;
    nome: string;
    codigo: string | null;
    codigoBarras: string;
    margem: number;
    unidadeComercial: string | null;
}

export interface LoteDTO {
    id: number | null;
    numero: string | null;
    dataFabricacao: string | null;
    dataValidade: string | null;
}