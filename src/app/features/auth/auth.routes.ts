import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './auth-layout/auth-layout.component';
import { guestGuard } from '@core/auth/auth.guard';

/**
 * Sign-in and sign-up pages inside the auth layout.
 *
 * Only reachable without a session ({@link guestGuard}).
 */
export const AUTH_ROUTES: Routes = [
    {
        path: '',
        component: AuthLayoutComponent,
        canActivate: [guestGuard],
        children: [
            {
                path: '',
                redirectTo: 'sign-in',
                pathMatch: 'full'
            },
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
