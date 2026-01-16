import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { Observable } from 'rxjs/internal/Observable';
import { LoadingService } from '../../core/services/loading.service';
import { ToastService } from '../../core/services/toast.service';
import { ApiResponse, ConfiguracaoDto } from './models/configuracaoDTO.model';

@Component({
  selector: 'app-configuracao',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './configuracao.component.html',
  styleUrl: './configuracao.component.scss',
})
export class ConfiguracaoComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  configuracoes: ConfiguracaoDto[] = [];
  forms: Record<number, FormGroup> = {};
  loading = false;
  loading$: Observable<boolean>;

  constructor(
    public loadingService: LoadingService) {
    this.loading$ = loadingService.loading$;    
  }

  ngOnInit(): void {
    this.buscarConfiguracoes();
  }

  buscarConfiguracoes(): void {
    this.loading = true;

    this.http
      .get<ApiResponse<ConfiguracaoDto[]>>(
        'https://localhost:7280/api/Configuracao'
      )
      .subscribe({
        next: (res) => {
          this.configuracoes = res.data;
          this.criarForms();
        },
        error: (err) => {
          this.toast.erro(
            err.error?.message || 'Erro ao carregar configurações'
          );
        },
      });
  }

  criarForms(): void {
    this.forms = {};

    for (const cfg of this.configuracoes) {
      this.forms[cfg.id] = this.fb.group({
        valor: [cfg.valor],
      });
    }
  }

  salvar(cfg: ConfiguracaoDto): void {
    const form = this.forms[cfg.id];

    if (form.invalid) {
      return;
    }

    const payload = {
      id: cfg.id,
      eNomeConfiguracao: cfg.eNomeConfiguracao,
      valor: `${form.value.valor}`,
    };

    this.http
      .put<ApiResponse<null>>(
        `https://localhost:7280/api/Configuracao/${cfg.id}`,
        payload
      )
      .subscribe({
        next: (res) => {
          this.toast.sucesso(res.message);
        },
        error: (err) => {
          this.toast.erro(
            err.error?.message || 'Erro ao atualizar configuração'
          );
        },
      });
  }
}
