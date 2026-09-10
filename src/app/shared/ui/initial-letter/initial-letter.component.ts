import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';

/** Avatar size. */
export type InitialLetterSize = 'sm' | 'md' | 'lg' | 'xl';
/** `'dark'` is the outlined variant used in the header. */
export type InitialLetterBorderColor = 'default' | 'dark';

/**
 * Round avatar with the initials of a name.
 *
 * The background color is derived from the name, so a person always gets the
 * same color.
 */
@Component({
    selector: 'ui-initial-letter',
    imports: [],
    templateUrl: './initial-letter.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './initial-letter.component.scss'
})
export class InitialLetterComponent {
    /** Full name; first and last word give the initials. */
    readonly name = input.required<string>();

    readonly size = input<InitialLetterSize>('md');

    /** `'dark'` renders the outlined header variant without background color. */
    readonly borderColor = input<InitialLetterBorderColor>('default');

    /** Up to two uppercase initials, e.g. `'Anna Maria Schmidt'` → `'AS'`. */
    readonly initials = computed(() => {
        const parts = this.name().trim().split(/\s+/).filter(Boolean);

        if (parts.length === 0) {
            return '';
        }

        const first = parts[0][0];
        const last = parts.length > 1 ? parts[parts.length - 1][0] : '';

        return (first + last).toUpperCase();
    });

    /** Palette color picked by a hash of the name; `null` for the `'dark'` variant. */
    readonly backgroundColor = computed<string | null>(() => {
        if (this.borderColor() !== 'default') {
            return null;
        }

        const palette = [
            '#FF7A00',
            '#9327FF',
            '#FF745E',
            '#FFC701',
            '#FFE62B',
            '#FF5EB3',
            '#00BEE8',
            '#FFA35E',
            '#0038FF',
            '#FF4646',
            '#6E52FF',
            '#1FD7C1',
            '#FC71FF',
            '#C3FF2B',
            '#FFBB2B'
        ];

        const name = this.name();
        let hash = 0;

        for (const char of name) {
            hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
        }

        return palette[(hash >>> 0) % palette.length];
    });
}
