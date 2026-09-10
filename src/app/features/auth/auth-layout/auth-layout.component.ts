import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouteStateService } from '@shared/services/route-state.service';
import { LinkComponent, type LinkStyle } from '@shared/ui/link/link.component';
import { LogoComponent } from '@shared/ui/logo/logo.component';

/** Link in the auth footer. */
interface NavItem {
    href: string;
    label: string;
    icon?: string;
    linkStyle: LinkStyle;
}

/** Duration of the logo splash in milliseconds. */
const SPLASH_DURATION_MS = 800;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Module-level flag: the splash plays only once per page load. */
let splashPlayed = false;

/**
 * Frame for the sign-in and sign-up pages.
 *
 * On the first visit per page load it shows a short logo splash, unless the
 * user prefers reduced motion.
 */
@Component({
    selector: 'auth-layout',
    imports: [RouterOutlet, LinkComponent, LogoComponent],
    templateUrl: './auth-layout.component.html',
    styleUrl: './auth-layout.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthLayoutComponent implements OnInit {
    routeStateService = inject(RouteStateService);
    private readonly destroyRef = inject(DestroyRef);

    /** Legal links in the footer. */
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

    /** `true` while the splash overlay is visible. */
    protected readonly splashActive = signal(false);

    ngOnInit(): void {
        this.playSplash();
    }

    /** Shows the splash for {@link SPLASH_DURATION_MS}; skipped after the first run and with reduced motion. */
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
