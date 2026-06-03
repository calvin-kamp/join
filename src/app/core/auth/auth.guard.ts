import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const guestGuard: CanActivateFn = async () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    await auth.whenReady();

    return auth.isLoggedIn() ? router.createUrlTree(['/summary']) : true;
};

export const authGuard: CanActivateFn = async () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    await auth.whenReady();

    return auth.isLoggedIn() ? true : router.createUrlTree(['/auth/sign-in']);
};

export const rootRedirectGuard: CanActivateFn = async () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    await auth.whenReady();

    return router.createUrlTree([auth.isLoggedIn() ? '/summary' : '/auth/sign-in']);
};
