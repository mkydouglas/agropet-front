export interface ConfiguracaoDto {
  id: number;
  eNomeConfiguracao: number;
  nome: string;
  valor: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
