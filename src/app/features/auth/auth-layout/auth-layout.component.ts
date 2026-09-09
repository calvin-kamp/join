import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
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

const SPLASH_DURATION_MS = 800;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

let splashPlayed = false;

@Component({
    selector: 'auth-layout',
    imports: [RouterOutlet, LinkComponent, LogoComponent],
    templateUrl: './auth-layout.component.html',
    styleUrl: './auth-layout.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthLayoutComponent {
    routeStateService = inject(RouteStateService);
    private readonly destroyRef = inject(DestroyRef);

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

    protected readonly splashActive = signal(false);

    constructor() {
        this.playSplash();
    }

    private playSplash(): void {
        if (splashPlayed) {
            return;
        }

        splashPlayed = true;

        if (matchMedia(REDUCED_MOTION_QUERY).matches) {
            return;
        }

        this.splashActive.set(true);

        const timeout = setTimeout(() => this.splashActive.set(false), SPLASH_DURATION_MS);
        this.destroyRef.onDestroy(() => clearTimeout(timeout));
    }
}
