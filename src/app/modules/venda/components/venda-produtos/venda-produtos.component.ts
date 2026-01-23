import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Observable, map, startWith, filter, of, Subject, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-venda-produtos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './venda-produtos.component.html',
  styleUrls: ['./venda-produtos.component.scss']
})
export class VendaProdutosComponent {

  @Input() produtosSelecionados!: FormArray;

  @Output() produtoAdicionado = new EventEmitter<FormGroup>();
  @Output() produtoRemovido = new EventEmitter<number>();

  @ViewChild('entradaProduto') entradaProduto!: ElementRef<HTMLInputElement>;

  entradaControl = new FormControl('');

  produtos: any[] = []; // depois vem da API
  produtosFiltrados$ = new Subject<any[]>();

  constructor(private fb: FormBuilder, private http: HttpClient, private toast: ToastService) {}

  ngOnInit() {
    this.http.get<any>('https://localhost:7280/api/v1/Produto/listar').subscribe(data => {
      this.produtos = data.data;
    });

    this.entradaControl.valueChanges.pipe(
      filter((value): value is string => typeof value === 'string'),
      map(value => value.trim()),
      tap(value => {
        if (value.length < 3) {
          this.produtosFiltrados$.next([]);
        }
      }),
      filter(value => value.length >= 3),
      map(value => this.filtrarPorNome(value))
    ).subscribe(produtos => {
      this.produtosFiltrados$.next(produtos);
    });
  }

  /** ===== CORE PDV ===== */

  processarEntrada() {
    const valor = this.entradaControl.value?.trim();
    if (!valor) return;

    const match = valor.match(/^(\d+)\*(.+)$/);

    if (match) {
      const quantidade = Number(match[1]);
      const codigo = match[2];
      this.adicionarPorCodigo(codigo, quantidade);
      return;
    }

    this.adicionarPorCodigo(valor, 1);
  }

  adicionarPorCodigo(codigo: string, quantidade: number) {
    const encontrados = this.produtos.filter(
      p => p.codigoBarras === codigo
    );    

    if (encontrados.length === 1) {
      this.adicionarProduto(encontrados[0], quantidade);
      this.resetarEntrada();
    } else {
      // fallback: mantém texto para busca manual
    }
  }

  adicionarProduto(produto: any, quantidade: number) {
    if(quantidade > produto.quantidadeProduto) {
      this.toast.erro('Quantidade não disponível em estoque');
      return;
    }

    const form = this.fb.group({
      idProduto: [produto.id],
      nome: [produto.nome],
      codigoBarras: [produto.codigoBarras],
      quantidade: [quantidade, Validators.required],
      valorUnitario: [produto.precoVenda],
      valorTotal: [produto.precoVenda * quantidade]
    });

    this.produtoAdicionado.emit(form);
  }

  removerProduto(index: number) {
    this.produtoRemovido.emit(index);
  }

  selecionarProduto(produto: any) {
    this.adicionarProduto(produto, 1);
    this.resetarEntrada();
  }

  resetarEntrada() {
    this.entradaControl.setValue('');
    this.produtosFiltrados$.next([]);
    setTimeout(() => this.entradaProduto.nativeElement.focus());
  }

  filtrarPorNome(valor: string): any[] {
    let filtro = valor.toLowerCase();

    let quantidadeEcodigo;
    if(valor.includes('*')){
      quantidadeEcodigo = valor.split('*');
      filtro = quantidadeEcodigo[1].toLowerCase();
    }    
    
    return this.produtos.filter(p =>
      p.nome.toLowerCase().includes(filtro) ||
      p.codigoBarras.includes(filtro)
    );
  }

  displayProduto(produto: any): string {
    return produto ? `${produto.codigoBarras} - ${produto.nome}` : '';
  }
}