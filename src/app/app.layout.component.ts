import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { LoadingComponent } from "./core/loading/loading.component";
import { LoadingService } from "./core/services/loading.service";
import { SidebarComponent } from "./core/sidebar/sidebar.component";

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [RouterOutlet, SidebarComponent, LoadingComponent, CommonModule],
    template: `
        <app-sidebar>
            <router-outlet></router-outlet>
        </app-sidebar>
        
        <app-loading *ngIf="loading$ | async" />
    `
})
export class AppLayoutComponent {
    private loadingService = inject(LoadingService);

    loading$ = this.loadingService.loading$;
}
  