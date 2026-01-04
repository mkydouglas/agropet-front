import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { finalize } from "rxjs";
import { LoadingService } from "../services/loading.service";

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {

  constructor(private loading: LoadingService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    this.loading.show();

    return next.handle(req).pipe(
      finalize(() => this.loading.hide())
    );
  }
}