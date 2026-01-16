import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ReactiveFormsModule,
  FormArray,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMaskDirective } from 'ngx-mask';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-produto-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    NgxMaskDirective,
  ],
  templateUrl: './produto.component.html',
  styleUrl: './produto.component.scss',
})
export class ProdutoComponent implements OnInit {

  displayedColumns = [
    'nome',
    'codigo',
    'codigoBarras',
    'margem',
    'precoVenda',
    'unidadeComercial',
    'quantidadeProduto',
    'fornecedores',
    'acoes'
  ];

  dataSource: any[] = [];

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      produtos: this.fb.array([])
    });
  }

  get produtos(): FormArray {
    return this.form.get('produtos') as FormArray;
  }

  ngOnInit(): void {
    this.carregarProdutos();
  }

  private carregarProdutos(): void {
    this.http
      .get<any>('https://localhost:7280/api/v1/Produto/listar')
      .subscribe({
        next: (res) => {
          this.dataSource = res.data ?? [];
          this.produtos.clear();

          for (const p of this.dataSource) {
            this.produtos.push(this.createProdutoForm(p));
          }
        },
        error: () => this.toast.erro('Erro ao carregar produtos')
      });
  }

  private createProdutoForm(p: any): FormGroup {
    return this.fb.group({
      id: [p.id],
      nome: [p.nome, Validators.required],
      codigo: [p.codigo, Validators.required],
      codigoBarras: [p.codigoBarras, Validators.required],
      margem: [p.margem],
      precoVenda: [p.precoVenda, Validators.required],
      unidadeComercial: [p.unidadeComercial, Validators.required],
      quantidadeProduto: [p.quantidadeProduto],
      nomeFantasiaFornecedores: [p.nomeFantasiaFornecedores]
    });
  }

  salvar(index: number): void {
    const formGroup = this.produtos.at(index);

    if (formGroup.invalid) {
      formGroup.markAllAsTouched();
      this.toast.erro('Preencha todos os campos obrigatórios.');
      return;
    }

    const {
      id,
      nome,
      codigo,
      codigoBarras,
      margem,
      precoVenda,
      unidadeComercial
    } = formGroup.value;

    this.http
      .put<any>(`https://localhost:7280/api/v1/Produto/${id}`, {
        id,
        nome,
        codigo,
        codigoBarras,
        margem,
        precoVenda,
        unidadeComercial
      })
      .subscribe({
        next: (res) => {
          this.toast.sucesso(res.message);
          formGroup.markAsPristine();
        },
        error: (err) =>
          this.toast.erro(err?.error?.message || 'Erro ao salvar produto')
      });
  }
}
