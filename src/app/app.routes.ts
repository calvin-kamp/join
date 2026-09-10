import { Routes } from '@angular/router';
import { authGuard, guestGuard } from '@core/auth/auth.guard';
import { MainLayoutComponent } from '@core/layout/main-layout.component';

/**
 * Top-level route table.
 *
 * - Authenticated feature routes (summary, contacts, tasks) share the main
 *   layout and are protected by {@link authGuard}.
 * - Public pages (legal notice, privacy policy, help) share the main layout
 *   without a guard.
 * - Auth pages (sign in, sign up) use their own layout.
 * - Unknown URLs redirect to the summary.
 */
export const ROUTES: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/summary'
    },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'summary',
                loadComponent: () =>
                    import('./features/summary/dashboard/dashboard.component').then((m) => m.DashboardComponent)
            },
            {
                path: 'contacts',
                loadChildren: () => import('./features/contacts/contacts.routes').then((m) => m.CONTACTS_ROUTES)
            },
            {
                path: 'tasks',
                loadChildren: () => import('./features/tasks/tasks.routes').then((m) => m.TASKS_ROUTES)
            }
        ]
    },
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            {
                path: '',
                loadChildren: () => import('./features/public/public.routes').then((m) => m.PUBLIC_ROUTES)
            }
        ]
    },
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES)
    },
    {
        path: '**',
        redirectTo: '/summary'
    }
];
