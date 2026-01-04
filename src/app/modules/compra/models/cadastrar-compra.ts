export interface CadastrarCompraCommand {
    numeroNotaFiscal: string | null;
    fornecedorDTO: FornecedorDTO;
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
    produtoDTO: ProdutoDTO;
}

export interface ProdutoDTO {
    id: number | null;
    nome: string;
    codigo: string | null;
    codigoBarras: string;
    margem: number;
    precoUnitarioCompra: number;
    unidadeComercial: string | null;
    quantidade: number;
    loteDTO: LoteDTO | null;
}

export interface LoteDTO {
    id: number | null;
    numero: string | null;
    quantidade: number | null;
    dataFabricacao: string | null;
    dataValidade: string | null;
}