import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { HttpClient } from '@angular/common/http';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-venda-pagamento',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    NgxMaskDirective,
  ],
  templateUrl: './venda-pagamento.component.html',
  styleUrls: ['./venda-pagamento.component.scss'],
})
export class VendaPagamentoComponent implements OnInit {
  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) valorTotal!: number;

  // mock — depois vem da API
  formasPagamento = [{ id: 1, nome: 'Dinheiro' }];
  formaSelecionada: any;

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get<any>('https://localhost:7280/api/v1/FormaPagamento/listar')
      .subscribe((data) => {
        this.formasPagamento = data.data;
      });
  }

  get formasSelecionadas(): FormArray<FormGroup> {
    return this.form.get('formas') as FormArray<FormGroup>;
  }

  get formasControls(): FormGroup[] {
    return this.formasSelecionadas.controls as FormGroup[];
  }

  /** ===== AÇÕES ===== */

  selecionarForma(forma: any) {
    this.formaSelecionada = forma;
    this.form.get('formaPagamento')?.setValue(forma);

    if (forma.nome === 'Dinheiro') {
      this.form.get('totalPago')?.enable();
      this.form.get('totalPago')?.setValue(this.valorTotal);
    } else {
      this.form.get('totalPago')?.disable();
      this.form.get('totalPago')?.setValue(this.valorTotal);
    }

    this.AdicionarPagamento(forma);
  }

  private AdicionarPagamento(forma: any, valor: number = 0) {
    if (this.formasSelecionadas.length > 0) {
      const index = this.formasSelecionadas.controls.findIndex(
        (f) => f.value.idFormaPagamento === forma.id
      );
      this.formasSelecionadas.removeAt(index);
    }

    const valorPago = valor === 0 ? this.valorTotal : valor;

    this.formasSelecionadas.push(
      this.fb.group({
        idFormaPagamento: [forma.id],
        nome: [forma.nome],
        valor: [valorPago, [Validators.required, Validators.min(0.01)]],
      })
    );
  }

  PagarNoDinheiro(event: any) {
    const valor = this.normalizarValor(event.target.value);
    this.form.get('totalPago')?.setValue(valor);
  }

  private normalizarValor(valor: any): number {
    if (valor == null) return 0;
  
    return Number(
      valor
        .toString()
        .replace(/[^\d,.-]/g, '') // remove R$, espaços, etc
        .replace('.', '')         // remove separador de milhar
        .replace(',', '.')        // vírgula → ponto
    );
  }  

  /** ===== DERIVADOS ===== */

  get totalPago(): number {
    return this.form.get('totalPago')?.value || 0;
  }

  get diferenca(): number {
    return this.totalPago - this.valorTotal;
  }

  get pagamentoValido(): boolean {
    return (
      this.totalPago >= this.valorTotal && this.formasSelecionadas.length > 0
    );
  }
}
