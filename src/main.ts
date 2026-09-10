import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

/** Starts the app with the global providers from `app.config.ts`. */
bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
