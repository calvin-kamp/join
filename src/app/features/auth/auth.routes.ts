import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layout/layout.component';

export const AUTH_ROUTES: Routes = [
    {
        path: '',
        component: AuthLayoutComponent,
        children: [
            {
                path: 'sign-in',
                loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent)
            },
            {
                path: 'sign-up',
                loadComponent: () => import('./register/register.component').then((m) => m.RegisterComponent)
            }
        ]
    }
];
