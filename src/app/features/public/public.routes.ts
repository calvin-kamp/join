import { Routes } from '@angular/router';
import { rootRedirectGuard } from '@core/auth/auth.guard';

/**
 * Pages reachable with and without a session.
 *
 * The empty path only redirects (see {@link rootRedirectGuard}).
 */
export const PUBLIC_ROUTES: Routes = [
    {
        path: 'legal-notice',
        loadComponent: () => import('./legal-notice/legal-notice.component').then((m) => m.LegalNoticeComponent)
    },
    {
        path: 'privacy-policy',
        loadComponent: () => import('./privacy-policy/privacy-policy.component').then((m) => m.PrivacyPolicyComponent)
    },
    {
        path: 'help',
        loadComponent: () => import('./help/help.component').then((m) => m.HelpComponent)
    }
];
