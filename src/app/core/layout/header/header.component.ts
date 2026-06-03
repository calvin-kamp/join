import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { LogoComponent } from '@shared/ui/logo/logo.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { LinkComponent } from '@shared/ui/link/link.component';
import { InitialLetterComponent } from '@shared/ui/initial-letter/initial-letter.component';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface NavLink {
    href: string;
    label: string;
    mobileOnly?: boolean;
}

@Component({
    selector: 'layout-header',
    imports: [LogoComponent, LinkComponent, IconComponent, InitialLetterComponent],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
    auth = inject(AuthService);
    private router = inject(Router);

    protected readonly displayName = this.auth.displayName;
    protected readonly showNavigation = signal(false);

    protected readonly navigationLinks: NavLink[] = [
        {
            href: '/help',
            label: 'Help',
            mobileOnly: true
        },
        {
            href: '/legal-notice',
            label: 'Legal Notice'
        },
        {
            href: '/privacy-policy',
            label: 'Privacy Policy'
        }
    ];

    constructor() {
        this.router.events
            .pipe(
                filter((e) => e instanceof NavigationEnd),
                takeUntilDestroyed()
            )
            .subscribe(() => this.showNavigation.set(false));
    }

    protected toggleNavigation(): void {
        this.showNavigation.update((open) => !open);
    }

    protected async logout(): Promise<void> {
        this.showNavigation.set(false);

        if (this.auth.isLoggedIn()) {
            await this.auth.signOut();

            return;
        }

        await this.router.navigateByUrl('/');
    }
}
