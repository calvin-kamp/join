import { Routes } from '@angular/router';
import { MainLayoutComponent } from '@core/layout/main-layout.component';

export const ROUTES: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            {
                path: '',
                loadChildren: () => import('./features/public/public.routes').then((m) => m.PUBLIC_ROUTES)
            },
            {
                path: 'summary',
                loadComponent: () =>
                    import('./features/summary/dashboard/dashboard.component').then((m) => m.DashboardComponent)
            },
            {
                path: 'contacts',
                loadChildren: () => import('./features/contacts/contacts.routes').then((m) => m.CONTACTS_ROUTES)
            }
        ]
    },
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES)
    },
    {
        path: '**',
        redirectTo: ''
    }
];
