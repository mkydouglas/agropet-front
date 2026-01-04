import { Routes } from '@angular/router';
import { AppLayoutComponent } from './app.layout.component';
import { authGuard } from './core/guard/auth.guard';
import { loginGuard } from './core/guard/login.guard';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
    },
    {
        path: 'login',
        canActivate: [loginGuard],
        component: LoginComponent
    },
    {
      path: '',
      canActivate: [authGuard],
      component: AppLayoutComponent,
      children: [
        {
            path: 'home',
            loadComponent: () => import('./home/home.component')
                .then(m => m.HomeComponent)
        },
        {
          path: 'cadastrar-compra',
          loadComponent: () =>
            import('./modules/compra/cadastrar-compra/cadastrar-compra.component')
              .then(m => m.CadastrarCompraComponent)
        },
        {
          path: 'venda',
          loadComponent: () =>
            import('./modules/venda/venda.component')
              .then(m => m.VendaComponent)
        }
      ]
    },
    { path: '**', redirectTo: 'login' }
];  
