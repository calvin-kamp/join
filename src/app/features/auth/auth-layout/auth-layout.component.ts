import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouteStateService } from '@shared/services/route-state.service';
import { LinkComponent, type LinkStyle } from '@shared/ui/link/link.component';
import { LogoComponent } from '@shared/ui/logo/logo.component';

interface NavItem {
    href: string;
    label: string;
    icon?: string;
    linkStyle: LinkStyle;
}

@Component({
    selector: 'auth-layout',
    imports: [RouterOutlet, LinkComponent, LogoComponent],
    templateUrl: './auth-layout.component.html',
    styleUrl: './auth-layout.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthLayoutComponent {
    routeStateService = inject(RouteStateService);

    readonly footerNav: NavItem[] = [
        {
            href: '/privacy-policy',
            label: 'Privacy Policy',
            linkStyle: 'muted'
        },
        {
            href: '/legal-notice',
            label: 'Legal Notice',
            linkStyle: 'muted'
        }
    ];
}
