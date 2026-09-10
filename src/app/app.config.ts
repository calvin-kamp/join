import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { ROUTES } from './app.routes';

/**
 * Global application providers.
 *
 * `withComponentInputBinding()` passes route params (e.g. `:id`) directly
 * into component inputs of the same name.
 */
export const appConfig: ApplicationConfig = {
    providers: [provideBrowserGlobalErrorListeners(), provideRouter(ROUTES, withComponentInputBinding())]
};
