import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { IconComponent, type IconName } from '@shared/ui/icon/icon.component';
import { LinkComponent } from '@shared/ui/link/link.component';
import { LogoComponent } from '@shared/ui/logo/logo.component';

interface NavLink {
    href: string;
    label: string;
    iconName: IconName;
    activeOptions: {
        exact: boolean;
    };
}

@Component({
    selector: 'layout-footer',
    imports: [IconComponent, LinkComponent, LogoComponent],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
    readonly auth = inject(AuthService);

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
