import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { IconComponent, type IconName } from '@shared/ui/icon/icon.component';
import { LinkComponent } from '@shared/ui/link/link.component';
import { LogoComponent } from '@shared/ui/logo/logo.component';

/** Entry of the main navigation. */
interface NavLink {
    href: string;
    label: string;
    iconName: IconName;
    /** `exact: true` marks the link active only on its exact URL, not on child routes. */
    activeOptions: {
        exact: boolean;
    };
}

/**
 * Main navigation: bottom bar on mobile, sidebar on desktop.
 *
 * Shows the feature links with a session and the login and legal links
 * without one.
 */
@Component({
    selector: 'layout-footer',
    imports: [IconComponent, LinkComponent, LogoComponent],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
    readonly auth = inject(AuthService);

    /** Feature links shown with a session. */
    protected readonly navigationLinks: NavLink[] = [
        {
            href: '/summary',
            label: 'Summary',
            iconName: 'nav-summary',
            activeOptions: {
                exact: true
            }
        },
        {
            href: '/tasks/add-task',
            label: 'Add Task',
            iconName: 'nav-add-task',
            activeOptions: {
                exact: true
            }
        },
        {
            href: '/tasks/board',
            label: 'Board',
            iconName: 'nav-board',
            activeOptions: {
                exact: true
            }
        },
        {
            href: '/contacts',
            label: 'Contacts',
            iconName: 'nav-contacts',
            activeOptions: {
                exact: false
            }
        }
    ];
}
