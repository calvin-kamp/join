import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Allows a route only for visitors without a session.
 *
 * Logged-in users are redirected to `/summary`.
 */
export const guestGuard: CanActivateFn = async () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    await auth.whenReady();

    return auth.isLoggedIn() ? router.createUrlTree(['/summary']) : true;
};

/**
 * Allows a route only for users with a session.
 *
 * Visitors without a session are redirected to `/auth/sign-in`.
 */
export const authGuard: CanActivateFn = async () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    await auth.whenReady();

    return auth.isLoggedIn() ? true : router.createUrlTree(['/auth/sign-in']);
};

/**
 * Never activates its route; redirects to `/summary` with a session and to
 * `/auth/sign-in` without one.
 */
export const rootRedirectGuard: CanActivateFn = async () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    await auth.whenReady();

    return router.createUrlTree([auth.isLoggedIn() ? '/summary' : '/auth/sign-in']);
};
