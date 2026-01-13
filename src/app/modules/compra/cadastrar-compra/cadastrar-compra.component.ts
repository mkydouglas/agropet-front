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
import { ToastService } from '../../../core/services/toast.service';
import { NgxMaskDirective } from 'ngx-mask';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-cadastrar-compra',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxMaskDirective,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
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
    public loadingService: LoadingService,
    private toast: ToastService
  ) {
    this.loading$ = loadingService.loading$;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      numeroNotaFiscal: [''],
      fornecedor: this.fb.group({
        id: [null],
        cnpj: ['', [Validators.required, Validators.minLength(14)]],
        nomeFantasia: ['', [Validators.required]],
        razaoSocial: [''],
        telefone: ['', [Validators.minLength(10)]],
      }),
      itensComprados: this.fb.array([])
    });

    this.adicionarItem();
    this.carregarProdutos();
    this.carregarFornecedores();

    this.form.get('fornecedor.cnpj')?.valueChanges.subscribe(() => {
      const fornecedorForm = this.form.get('fornecedor') as FormGroup;
    
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
      produto: this.fb.group({
        id: [null],
        nome: ['', [Validators.required]],
        codigo: [''],
        codigoBarras: ['', Validators.required],
        margem: [null],
        unidadeComercial: [null, Validators.required],
      }),
      precoUnitarioCompra: [null, Validators.required],
      quantidade: [null, Validators.required],
      lote: this.fb.group({
        numero: [''],
        dataFabricacao: [null],
        dataValidade: [null]
      })
    });

    itemForm.get('produto.nome')?.valueChanges.subscribe(() => {
      const produtoForm = itemForm.get('produto') as FormGroup;
      const loteForm = itemForm.get('lote') as FormGroup;

      if (!produtoForm.get('nome')?.value) {
        produtoForm.patchValue({
          id: null,
          codigo: null,
          codigoBarras: null,
          margem: null,
          unidadeComercial: null
        });

        itemForm.get('precoUnitarioCompra')?.setValue(null)
        itemForm.get('quantidade')?.setValue(null)
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
    const nome = this.itens.at(index).get('produto.nome')?.value?.toLowerCase();

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
    const produtoForm = this.itens.at(index).get('produto') as FormGroup;

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
    const cnpjDigitado = this.form.get('fornecedor.cnpj')?.value;
  
    if (!cnpjDigitado) {
      this.fornecedoresFiltrados = [];
      return;
    }
  
    this.fornecedoresFiltrados = this.fornecedores
      .filter(f => f.cnpj.includes(cnpjDigitado));
  }

  selecionarFornecedor(fornecedor: any): void {
    const fornecedorForm = this.form.get('fornecedor') as FormGroup;

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
          this.toast.sucesso(res.message);
          input.value = '';
        },
        error: (err) => {
          this.toast.erro(err.error.message);
          input.value = '';
        }
      });
  }
  
  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.erro('Preencha todos os campos obrigatórios');
      return;
    }
  
    this.mensagem = '';
    let request = this.form.getRawValue() as CadastrarCompraCommand
    request.itensComprados.forEach(ic => {
      ic.lote = this.normalizarLote(ic.lote)
    })
    console.log(request);
    
  
    this.http
      .post<any>(
        'https://localhost:7280/api/v1/Compra/cadastro-manual',
        request
      )
      .subscribe({
        next: (res) => {
          this.toast.sucesso(res.message);
          this.form.reset();
        },
        error: (err) => {
          this.toast.erro(err.error.message);
        }
      });
  }

  isInvalid(path: string): boolean {
    const control = this.form.get(path);
    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty)
    );
  }
  
  private normalizarLote(lote: any) {
    if (!lote) return null;
  
    const { numero, dataFabricacao, dataValidade } = lote;
  
    const todosVazios =
      !numero &&
      !dataFabricacao &&
      !dataValidade;
  
    return todosVazios ? null : lote;
  }  
}