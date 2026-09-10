import { Injectable, inject, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';

/**
 * Current URL path as signal plus layout flags derived from it.
 */
@Injectable({
    providedIn: 'root'
})
export class RouteStateService {
    router = inject(Router);

    /** Current path without query string and fragment. */
    url = toSignal(
        this.router.events.pipe(
            filter((e) => e instanceof NavigationEnd),
            map(() => this.cleanPath(this.router.url)),
            startWith(this.cleanPath(this.router.url))
        ),
        { initialValue: this.cleanPath(this.router.url) }
    );

    /** Routes on which the page itself doesn't scroll (their panels scroll instead). */
    lockedRoutes = ['/contacts'];

    /** `true` on a route from {@link lockedRoutes}. */
    isViewportLocked = computed(() => this.lockedRoutes.some((path) => this.url().startsWith(path)));

    /** `false` on the sign-up page, where the "Sign up" link would point to itself. */
    showAuthSignUp = computed(() => !this.url().startsWith('/auth/sign-up'));

    /** Removes query string and fragment from a URL. */
    cleanPath(url: string): string {
        return url.split('?')[0].split('#')[0];
    }
}
