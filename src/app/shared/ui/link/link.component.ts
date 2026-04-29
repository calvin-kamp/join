import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from '@shared/directives/button.directive';

type ButtonVariant = 'primary' | 'outlined';
type LinkVariant = 'default' | ButtonVariant;
export type LinkStyle = 'default' | 'muted' | 'no-decoration';

@Component({
    selector: 'ui-link',
    imports: [RouterLink, ButtonDirective],
    templateUrl: './link.component.html',
    styleUrl: './link.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkComponent {
    readonly href = input<string | null>(null);
    readonly variant = input<LinkVariant>('default');
    readonly linkStyle = input<LinkStyle>('default');
    readonly label = input<string>('');

    protected readonly isExternal = computed(() => {
        const href = this.href();

        if (!href) {
            return false;
        }
        console.log(href);
        console.log(href.startsWith('https:'));

        return /^(https?:|mailto:|tel:)|^\/\//.test(href);
    });

    protected readonly opensInNewTab = computed(() => {
        const href = this.href();

        if (!href) {
            return false;
        }
        return /^https?:\/\/|^\/\//.test(href);
    });

    protected readonly buttonVariant = computed<ButtonVariant | null>(() =>
        this.variant() === 'default' ? null : (this.variant() as ButtonVariant)
    );

    protected readonly linkClasses = computed(() => ({
        link: this.variant() === 'default',
        'link--muted': this.linkStyle() === 'muted',
        'link--no-decoration': this.linkStyle() === 'no-decoration'
    }));
}
