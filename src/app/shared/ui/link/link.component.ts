import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonDirective } from '@shared/directives/button.directive';

type ButtonVariant = 'primary' | 'outlined';
type LinkVariant = 'default' | ButtonVariant;
/** Text style of a link without button variant. */
export type LinkStyle = 'default' | 'muted' | 'no-decoration';

/**
 * Link that switches between router navigation and a plain `<a href>`.
 *
 * Internal paths use the router; `http(s):`, `mailto:`, `tel:` and `//` use a
 * plain link (web URLs open in a new tab). With a button `variant` it looks
 * like a button.
 */
@Component({
    selector: 'ui-link',
    imports: [RouterLink, RouterLinkActive, ButtonDirective, NgTemplateOutlet],
    templateUrl: './link.component.html',
    styleUrl: './link.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkComponent {
    /** Target path or URL. Without it the `<a>` has no href and is not keyboard-focusable. */
    readonly href = input<string | null>(null);

    /** `'default'` renders a text link; other values render as button. */
    readonly variant = input<LinkVariant>('default');

    /** Text style for `variant="default"`. */
    readonly linkStyle = input<LinkStyle>('default');

    /** Class added while the router link is active. */
    readonly activeClass = input<string>('');

    /** `exact: true` marks the link active only on its exact URL. */
    readonly activeOptions = input<{ exact: boolean }>({ exact: false });

    /** Extra classes for the inner `<a>`. */
    readonly linkClass = input<string>('');

    /** `true` for URLs outside the app. */
    protected readonly isExternal = computed(() => {
        const href = this.href();

        if (!href) {
            return false;
        }

        return /^(https?:|mailto:|tel:)|^\/\//.test(href);
    });

    /** `true` for web URLs; they open in a new tab. */
    protected readonly opensInNewTab = computed(() => {
        const href = this.href();

        if (!href) {
            return false;
        }

        return /^https?:\/\/|^\/\//.test(href);
    });

    /** Button variant for the `uiButton` directive, `null` for text links. */
    protected readonly buttonVariant = computed<ButtonVariant | null>(() =>
        this.variant() === 'default' ? null : (this.variant() as ButtonVariant)
    );

    /** Class list of the inner `<a>`. */
    protected readonly linkClasses = computed(() => {
        const baseClasses = {
            link: this.variant() === 'default',
            'link--muted': this.linkStyle() === 'muted',
            'link--no-decoration': this.linkStyle() === 'no-decoration'
        };

        const classArray = Object.entries(baseClasses)
            .filter(([_, value]) => value)
            .map(([key]) => key);

        const customClasses = this.linkClass();

        if (customClasses) {
            classArray.push(customClasses);
        }

        return classArray.join(' ');
    });
}
