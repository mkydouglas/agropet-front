import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {

  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loading$.asObservable();

  show(): void {
    Promise.resolve().then(() => {
      this._loading$.next(true);
    });
  }

  hide(): void {
    Promise.resolve().then(() => {
      this._loading$.next(false);
    });
  }
}