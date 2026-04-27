import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LinkComponent, type LinkStyle } from '@shared/ui/link/link.component';

interface NavItem {
    href: string;
    label: string;
    icon?: string;
    linkStyle: LinkStyle;
}

@Component({
    selector: 'auth-layout',
    imports: [RouterOutlet, LinkComponent],
    templateUrl: './auth-layout.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthLayoutComponent {
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
