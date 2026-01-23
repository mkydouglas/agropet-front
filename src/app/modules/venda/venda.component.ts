import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';

import { VendaProdutosComponent } from './components/venda-produtos/venda-produtos.component';
import { VendaPagamentoComponent } from './components/venda-pagamento/venda-pagamento.component';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-venda',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    VendaProdutosComponent,
    VendaPagamentoComponent
  ],
  templateUrl: './venda.component.html',
  styleUrls: ['./venda.component.scss']
})
export class VendaComponent {

  vendaForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient, private toast: ToastService) {
    this.vendaForm = this.fb.group({
      produtos: this.fb.array([], Validators.required),
      pagamento: this.fb.group({
        formas: this.fb.array([], Validators.required),
        totalPago: [0]
      })
    });
  }

  /** ===== GETTERS ===== */

  get produtos(): FormArray {
    return this.vendaForm.get('produtos') as FormArray;
  }

  get pagamentoForm(): FormGroup {
    return this.vendaForm.get('pagamento') as FormGroup;
  }

  /** ===== DERIVADOS ===== */

  get valorTotal(): number {
    return this.produtos.controls.reduce((total, ctrl) => {
      return total + ctrl.value.valorTotal;
    }, 0);
  }

  get vendaValida(): boolean {
    if (this.vendaForm.invalid) return false;

    const totalPago = this.pagamentoForm.get('totalPago')?.value || 0;

    if (this.produtos.length === 0) return false;
    if (totalPago < this.valorTotal) return false;

    return true;
  }

  /** ===== CALLBACKS DOS FILHOS ===== */

  onProdutoAdicionado(produtoForm: FormGroup) {
    this.produtos.push(produtoForm);
  }

  onProdutoRemovido(index: number) {
    this.produtos.removeAt(index);
  }

  finalizarVenda() {
    if (!this.vendaValida) return;

    const venda = {
      produtos: this.produtos.value,
      pagamento: this.pagamentoForm.value,
      valorTotal: this.valorTotal
    };

    const payload = this.mapearPayload();

    this.http.post<any>('https://localhost:7280/api/v1/venda', payload).subscribe({
      next: (res) => {
        this.toast.sucesso(res.message);
        this.vendaForm.reset();
      },
      error: (err) => {        
        this.toast.erro(err.error.message);
      }
    });
  }

  mapearPayload(): any{
    const venda = {
      produtosVendidosInput: this.produtos.value.map((p: any) => ({
        idProduto: p.idProduto,
        precoProduto: p.valorUnitario,
        quantidade: p.quantidade,
        valorPago: p.valorTotal,
        desconto: 0 // ou calcule se existir
      })),
    
      qtdeTotalItens: this.produtos.value.reduce(
        (total: number, p: any) => total + p.quantidade,
        0
      ),
    
      valorTotal: this.valorTotal,
    
      formaPagamentoInput: this.pagamentoForm.value.formas.map((f: any) => ({
        idFormaPagamento: f.idFormaPagamento,
        valorPago: f.valor
      }))
    };

    return venda;
  }
}