import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LoadingService } from '../../../core/services/loading.service';
import { Observable } from 'rxjs';
import { CadastrarCompraCommand } from '../models/cadastrar-compra';

@Component({
  selector: 'app-cadastrar-compra',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  templateUrl: './cadastrar-compra.component.html',
  styleUrl: './cadastrar-compra.component.scss'
})
export class CadastrarCompraComponent implements OnInit {

  form!: FormGroup;
  produtos: any[] = [];
  produtosFiltrados: any[][] = [];
  fornecedores: any[] = [];
  fornecedoresFiltrados: any[] = [];
  loading$: Observable<boolean>;
  mensagem = '';
  sucesso = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public loadingService: LoadingService
  ) {
    this.loading$ = loadingService.loading$;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      numeroNotaFiscal: ['', Validators.required],
      fornecedorDTO: this.fb.group({
        id: [null],
        cnpj: [''],
        nomeFantasia: [''],
        razaoSocial: [''],
        telefone: ['']
      }),
      itensComprados: this.fb.array([])
    });

    this.adicionarItem();
    this.carregarProdutos();
    this.carregarFornecedores();

    this.form.get('fornecedorDTO.cnpj')?.valueChanges.subscribe(() => {
      const fornecedorForm = this.form.get('fornecedorDTO') as FormGroup;
    
      if (!fornecedorForm.get('cnpj')?.value) {
        fornecedorForm.patchValue({
          id: null,
          nomeFantasia: null,
          razaoSocial: null,
          telefone: null
        });
    
        ['nomeFantasia', 'razaoSocial', 'telefone']
          .forEach(campo =>
            fornecedorForm.get(campo)?.enable({ emitEvent: false })
          );
      }
    });
  }

  get itens(): FormArray {
    return this.form.get('itensComprados') as FormArray;
  }

  adicionarItem(): void {
    const itemForm = this.fb.group({
      produtoDTO: this.fb.group({
        id: [null],
        nome: [''],
        codigo: [''],
        codigoBarras: [''],
        precoUnitarioCompra: [null],
        margem: [null],
        unidadeComercial: [null],
        quantidade: [null],
        loteDTO: this.fb.group({
          numero: [''],
          dataFabricacao: [null],
          dataValidade: [null]
        })
      }),
    });

    itemForm.get('produto.nome')?.valueChanges.subscribe(() => {
      const produtoForm = itemForm.get('produtoDTO') as FormGroup;
      const loteForm = itemForm.get('produtoDTO.loteDTO') as FormGroup;

      if (!produtoForm.get('nome')?.value) {
        produtoForm.patchValue({
          id: null,
          codigo: null,
          codigoBarras: null,
          margem: null,
          precoUnitarioCompra: null,
          unidadeComercial: null,
          quantidade: null
        });

        loteForm.reset();

        produtoForm.get('codigo')?.enable();
        produtoForm.get('codigoBarras')?.enable();
        produtoForm.get('unidadeComercial')?.enable();
      }
    });

    this.itens.push(itemForm);
    this.produtosFiltrados.push([]);
  }

  carregarProdutos(): void {
    this.http
      .get<any>('https://localhost:7280/api/v1/Produto/listar')
      .subscribe(res => this.produtos = res.data);
  }

  filtrarProdutos(index: number): void {
    const nome = this.itens.at(index).get('produtoDTO.nome')?.value?.toLowerCase();

    if (!nome) {
      this.produtosFiltrados[index] = [];
      return;
    }

    this.produtosFiltrados[index] =
      this.produtos.filter(p =>
        p.nome.toLowerCase().includes(nome)
      );
  }

  selecionarProduto(index: number, produto: any): void {
    const produtoForm = this.itens.at(index).get('produtoDTO') as FormGroup;

    produtoForm.patchValue({
      id: produto.id,
      nome: produto.nome,
      codigo: produto.codigo,
      codigoBarras: produto.codigoBarras,
      margem: produto.margem > 0 ? produto.margem : null,
      unidadeComercial: produto.unidadeComercial
    });

    produtoForm.get('codigo')?.disable();
    produtoForm.get('codigoBarras')?.disable();
    produtoForm.get('unidadeComercial')?.disable();

    this.produtosFiltrados[index] = [];
  }

  removerItem(index: number): void {
    this.itens.removeAt(index);
    this.produtosFiltrados.splice(index, 1);
  }  

  carregarFornecedores(): void {
    this.http
      .get<any>('https://localhost:7280/api/v1/Fornecedor')
      .subscribe(res => this.fornecedores = res.data);
  }

  filtrarFornecedores(): void {
    const cnpjDigitado = this.form.get('fornecedorDTO.cnpj')?.value;
  
    if (!cnpjDigitado) {
      this.fornecedoresFiltrados = [];
      return;
    }
  
    this.fornecedoresFiltrados = this.fornecedores
      .filter(f => f.cnpj.includes(cnpjDigitado));
  }

  selecionarFornecedor(fornecedor: any): void {
    const fornecedorForm = this.form.get('fornecedorDTO') as FormGroup;

    fornecedorForm.enable({ emitEvent: false });
  
    fornecedorForm.patchValue({
      id: fornecedor.id,
      cnpj: fornecedor.cnpj,
      nomeFantasia: fornecedor.nomeFantasia,
      razaoSocial: fornecedor.razaoSocial,
      telefone: fornecedor.telefone
    }, { emitEvent: false });
  
    ['nomeFantasia', 'razaoSocial', 'telefone']
      .forEach(campo =>
        fornecedorForm.get(campo)?.disable({ emitEvent: false })
      );
  
    this.fornecedoresFiltrados = [];
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
  
    if (!input.files || input.files.length === 0) {
      return;
    }
  
    const file = input.files[0];
    const formData = new FormData();
    formData.append('file', file);
  
    this.mensagem = '';
  
    this.http
      .post<any>(
        'https://localhost:7280/api/v1/Compra/cadastro-via-nf',
        formData
      )
      .subscribe({
        next: (res) => {
          this.sucesso = res.success;
          this.mensagem = res.message;
          input.value = '';
        },
        error: (err) => {
          this.sucesso = false;
          this.mensagem = err.error.message;
          input.value = '';
        }
      });
  }
  
  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
  
    this.mensagem = '';
    let request = this.form.getRawValue() as CadastrarCompraCommand
    for(const item of request.itensComprados){
      if(item.produtoDTO.loteDTO?.numero)
        item.produtoDTO.loteDTO.quantidade = item.produtoDTO.quantidade;
    }

    console.log(request);
    
  
    this.http
      .post<any>(
        'https://localhost:7280/api/v1/Compra/cadastro-manual',
        request
      )
      .subscribe({
        next: (res) => {
          this.sucesso = res.success;
          this.mensagem = res.message;
        },
        error: () => {
          this.sucesso = false;
          this.mensagem = 'Erro ao salvar a compra.';
        }
      });
  }  
}