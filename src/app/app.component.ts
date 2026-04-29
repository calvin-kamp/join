import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LegalNoticeComponent } from '@features/public/legal-notice/legal-notice.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, LegalNoticeComponent],
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
    protected readonly title = signal('join');
}
