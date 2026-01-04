import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Observable, map, startWith } from 'rxjs';

@Component({
  selector: 'app-venda',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    MatOptionModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './venda.component.html',
  styleUrls: ['./venda.component.scss']
})
export class VendaComponent implements OnInit {
  produtos: any[] = [];
  produtosFiltrados$: Observable<any[]> = new Observable();
  formasPagamento: any[] = [];
  vendaForm: FormGroup;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.vendaForm = this.fb.group({
      produtosSelecionados: this.fb.array([]),
      formasPagamentoSelecionadas: this.fb.array([]),
      produtoForm: this.fb.group({
        produtoBusca: [''],
        produto: [null, Validators.required],
        quantidade: [1, [Validators.required, Validators.min(1)]]
      })
    });
  }

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:5278/api/Produto/listar').subscribe(data => {
      this.produtos = data;
      this.setupProdutoFiltro();
    });

    this.http.get<any[]>('http://localhost:5278/api/FormaPagamento/listar')
      .subscribe(data => this.formasPagamento = data);
  }

  setupProdutoFiltro(): void {
    this.produtosFiltrados$ = this.produtoForm.get('produtoBusca')!.valueChanges.pipe(
      startWith(''),
      map(valor => typeof valor === 'string' ? this.filtrarProdutos(valor) : this.produtos)
    );
  }

  displayProduto(prod: any): string {
    return prod ? `${prod.codigoBarras} - ${prod.nome}` : '';
  }

  filtrarProdutos(valor: string): any[] {
    const filtro = valor.toLowerCase();
    return this.produtos.filter(p =>
      p.nome.toLowerCase().includes(filtro) ||
      p.codigoBarras.toString().includes(filtro)
    );
  }

  get produtosSelecionados(): FormArray {
    return this.vendaForm.get('produtosSelecionados') as FormArray;
  }

  get formasPagamentoSelecionadas(): FormArray {
    return this.vendaForm.get('formasPagamentoSelecionadas') as FormArray;
  }

  get produtoForm(): FormGroup {
    return this.vendaForm.get('produtoForm') as FormGroup;
  }

  adicionarProduto(): void {
    const produtoSelecionado = this.produtoForm.value.produto;
    const quantidade = this.produtoForm.value.quantidade;

    if (!produtoSelecionado || quantidade <= 0) return;

    this.produtosSelecionados.push(this.fb.group({
      idProduto: [produtoSelecionado.id],
      codigoBarras: [produtoSelecionado.codigoBarras],
      nome: [produtoSelecionado.nome],
      precoProduto: [produtoSelecionado.precoVenda],
      quantidade: [quantidade],
      valorPago: [produtoSelecionado.precoVenda * quantidade]
    }));

    this.produtoForm.reset({ produto: null, produtoBusca: '', quantidade: 1 });
    this.setupProdutoFiltro();
  }

  removerProduto(index: number): void {
    this.produtosSelecionados.removeAt(index);
  }

  get valorTotal(): number {
    return this.produtosSelecionados.controls.reduce((acc, ctrl) => {
      return acc + ctrl.value.valorPago;
    }, 0);
  }

  toggleFormaPagamento(forma: any): void {
    const idx = this.formasPagamentoSelecionadas.controls.findIndex(ctrl => ctrl.value.idFormaPagamento === forma.id);
    if (idx > -1) {
      this.formasPagamentoSelecionadas.removeAt(idx);
    } else {
      const total = this.formasPagamentoSelecionadas.length === 0 ? this.valorTotal : 0;
      this.formasPagamentoSelecionadas.push(this.fb.group({
        idFormaPagamento: [forma.id],
        nome: [forma.nome],
        valorPago: [total, Validators.required]
      }));
    }
  }

  getValorPagoControl(ctrl: any) {
    return ctrl.get('valorPago');
  }

  enviarVenda(): void {
    const payload = {
      produtoVendaDTOs: this.produtosSelecionados.value.map((p: any) => ({
        idProduto: p.idProduto,
        precoProduto: p.precoProduto,
        quantidade: p.quantidade,
        valorPago: p.valorPago
      })),
      qtdeTotalItens: this.produtosSelecionados.value.reduce((acc: number, p: any) => acc + p.quantidade, 0),
      valorTotal: this.valorTotal,
      vendaFormaPagamentoDTOs: this.formasPagamentoSelecionadas.value.map((f: any) => ({
        idFormaPagamento: f.idFormaPagamento,
        valorPago: f.valorPago
      }))
    };

    this.http.post('http://localhost:5278/api/venda', payload).subscribe();
  }
}