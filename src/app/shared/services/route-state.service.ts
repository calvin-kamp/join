import { Injectable, inject, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RouteStateService {
    router = inject(Router);

    url = toSignal(
        this.router.events.pipe(
            filter((e) => e instanceof NavigationEnd),
            map(() => this.cleanPath(this.router.url)),
            startWith(this.cleanPath(this.router.url))
        ),
        { initialValue: this.cleanPath(this.router.url) }
    );

    lockedRoutes = ['/contacts'];
    isViewportLocked = computed(() => this.lockedRoutes.some((path) => this.url().startsWith(path)));

    showAuthSignUp = computed(() => !this.url().startsWith('/auth/sign-up'));

    cleanPath(url: string): string {
        return url.split('?')[0].split('#')[0];
    }
}
