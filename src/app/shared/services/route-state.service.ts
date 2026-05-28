import { Injectable, inject, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RouteStateService {
    router = inject(Router);

    scrollableRoutes = ['/tasks/board', '/tasks/add-task', '/contacts'];

    url = toSignal(
        this.router.events.pipe(
            filter((e) => e instanceof NavigationEnd),
            map(() => this.cleanPath(this.router.url)),
            startWith(this.cleanPath(this.router.url))
        ),
        { initialValue: this.cleanPath(this.router.url) }
    );

    isScrollable = computed(() => this.scrollableRoutes.some((path) => this.url().startsWith(path)));

    matches(path: string): boolean {
        return this.url().startsWith(path);
    }

    cleanPath(url: string): string {
        return url.split('?')[0].split('#')[0];
    }
}
