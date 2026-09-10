import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root component of the application.
 *
 * Renders only the router outlet; every visible layout is provided by the
 * routed layout components (`MainLayoutComponent`, `AuthLayoutComponent`).
 */
@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
    /** Application title. */
    protected readonly title = signal('join');
}
