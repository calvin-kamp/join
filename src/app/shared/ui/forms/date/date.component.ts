import {
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    forwardRef,
    input,
    signal,
    viewChild
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '@shared/ui/icon/icon.component';

/**
 * Date field with `dd/mm/yyyy` text input and a native date picker.
 *
 * The form value is an ISO date (`yyyy-mm-dd`). Typed dates are only passed
 * to the form when complete, valid and not in the past; incomplete input sets
 * the value to `''`.
 */
@Component({
    selector: 'ui-date',
    imports: [IconComponent],
    templateUrl: './date.component.html',
    styleUrl: './date.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DateComponent),
            multi: true
        }
    ]
})
export class DateComponent {
    /** Visible label. */
    label = input.required<string>();

    /** Name attribute; also used to build the element id. */
    name = input.required<string>();

    placeholder = input<string>('dd/mm/yyyy');

    /** Error text below the field; a non-empty text marks it invalid. */
    errorMessage = input<string>('');

    /** Sets `aria-required` and shows the required mark. */
    isRequired = input<boolean>(false);

    /** Stretches the field to the full width. */
    fullWidth = input<boolean>(false);

    protected readonly datePickerInput = viewChild<ElementRef<HTMLInputElement>>('datePickerInput');

    protected readonly value = signal('');
    protected readonly isDisabled = signal(false);
    protected readonly isFocused = signal(false);

    protected readonly inputId = computed(() => `ui-date-input-${this.name()}`);
    protected readonly hasError = computed(() => this.errorMessage().length > 0);
    /** Today as ISO date; the picker doesn't offer earlier dates. */
    protected readonly minDate = computed(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    /** The ISO value formatted as `dd/mm/yyyy` for the text input. */
    protected readonly displayValue = computed(() => {
        const val = this.value();
        if (!val) {
            return '';
        }

        const parts = val.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return val;
    });

    private onChange = (_: string) => {};
    private onTouched = () => {};

    /** Called by the forms API to set the ISO date. */
    writeValue(value: string | null): void {
        this.value.set(value ?? '');
    }

    /** Called by the forms API to register the change callback. */
    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    /** Called by the forms API to register the touched callback. */
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    /** Called by the forms API when the control is enabled or disabled. */
    setDisabledState(isDisabled: boolean): void {
        this.isDisabled.set(isDisabled);
    }

    /**
     * Formats typed digits as `dd/mm/yyyy` and passes complete, valid dates
     * to the form as ISO date.
     */
    protected onInput(event: Event): void {
        let input = (event.target as HTMLInputElement).value;

        input = input.replace(/[^\d/]/g, '');

        if (input.length === 2 && !input.includes('/')) {
            input = input + '/';
        } else if (input.length === 5 && input.split('/').length === 2) {
            input = input + '/';
        }

        const parts = input.split('/');
        if (parts.length > 3) {
            input = parts.slice(0, 3).join('/');
        }

        (event.target as HTMLInputElement).value = input;

        if (input.length === 10) {
            const [day, month, year] = input.split('/');
            const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

            const selectedDate = new Date(isoDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate >= today && this.isValidDate(day, month, year)) {
                this.value.set(isoDate);
                this.onChange(isoDate);
            }
        } else {
            this.value.set('');
            this.onChange('');
        }
    }

    /** Takes over the date chosen in the native picker. */
    protected onDatePickerChange(event: Event): void {
        const isoDate = (event.target as HTMLInputElement).value;
        this.value.set(isoDate);
        this.onChange(isoDate);
    }

    /** Opens the native date picker. */
    protected onIconClick(): void {
        if (!this.isDisabled()) {
            this.datePickerInput()?.nativeElement.showPicker?.();
        }
    }

    protected onFocus(): void {
        this.isFocused.set(true);
    }

    protected onBlur(): void {
        this.isFocused.set(false);
        this.onTouched();
    }

    /** `true` if day, month and year form an existing calendar date (e.g. not 31/02). */
    private isValidDate(day: string, month: string, year: string): boolean {
        const d = parseInt(day, 10);
        const m = parseInt(month, 10);
        const y = parseInt(year, 10);

        if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1000) {
            return false;
        }

        const date = new Date(y, m - 1, d);
        return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
    }
}
