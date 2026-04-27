import { Routes } from '@angular/router';
import { MainLayoutComponent } from '@core/layout/main-layout.component';

export const PUBLIC_ROUTES: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./entry/entry.component').then((m) => m.EntryComponent)
            },
            {
                path: 'legal-notice',
                loadComponent: () => import('./legal-notice/legal-notice.component').then((m) => m.LegalNoticeComponent)
            },
            {
                path: 'privacy-policy',
                loadComponent: () =>
                    import('./privacy-policy/privacy-policy.component').then((m) => m.PrivacyPolicyComponent)
            }
        ]
    }
];
