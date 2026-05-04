import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { ROUTES } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [provideBrowserGlobalErrorListeners(), provideRouter(ROUTES, withComponentInputBinding())]
};
