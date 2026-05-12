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
    label = input.required<string>();
    name = input.required<string>();

    placeholder = input<string>('dd/mm/yyyy');
    errorMessage = input<string>('');
    isRequired = input<boolean>(false);
    fullWidth = input<boolean>(false);

    protected readonly datePickerInput = viewChild<ElementRef<HTMLInputElement>>('datePickerInput');

    protected readonly value = signal('');
    protected readonly isDisabled = signal(false);
    protected readonly isFocused = signal(false);

    protected readonly inputId = computed(() => `ui-date-input-${this.name()}`);
    protected readonly hasError = computed(() => this.errorMessage().length > 0);
    protected readonly minDate = computed(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
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

    writeValue(value: string | null): void {
        this.value.set(value ?? '');
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled.set(isDisabled);
    }

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

    protected onDatePickerChange(event: Event): void {
        const isoDate = (event.target as HTMLInputElement).value;
        this.value.set(isoDate);
        this.onChange(isoDate);
    }

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
