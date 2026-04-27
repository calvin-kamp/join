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
                path: 'contact-list',
                loadComponent: () =>
                    import('./features/contacts/list/list.component').then((m) => m.ListComponent)
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
