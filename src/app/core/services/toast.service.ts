import { Injectable } from "@angular/core";
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class ToastService {

  constructor(private snackBar: MatSnackBar) {}

  sucesso(mensagem: string) {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: 4000,
      panelClass: ['toast-sucesso'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  erro(mensagem: string) {
    this.snackBar.open(mensagem, 'Fechar', {
      duration: 4000,
      panelClass: ['toast-erro'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}