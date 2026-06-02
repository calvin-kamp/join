import { ChangeDetectionStrategy, Component, computed, effect, forwardRef, input, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'ui-checkbox',
    imports: [],
    templateUrl: './checkbox.component.html',
    styleUrl: './checkbox.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CheckboxComponent),
            multi: true
        }
    ]
})
export class CheckboxComponent implements ControlValueAccessor {
    name = input<string>('');
    errorMessage = input<string>('');
    isRequired = input<boolean>(false);
    hideRequiredMark = input<boolean>(false);
    labelVisible = input<boolean>(true);
    fullWidth = input<boolean>(false);
    value = input<boolean>(false);

    changed = output<boolean>();

    protected readonly checked = signal(false);
    protected readonly isDisabled = signal(false);

    protected readonly inputId = computed(() => `ui-checkbox-${this.name()}`);
    protected readonly hasError = computed(() => this.errorMessage().length > 0);

    private onChange = (_: boolean) => {};
    private onTouched = () => {};

    constructor() {
        effect(() => {
            this.checked.set(this.value());
        });
    }

    writeValue(value: boolean): void {
        this.checked.set(!!value);
    }

    registerOnChange(fn: (value: boolean) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled.set(isDisabled);
    }

    protected onCheckedChange(event: Event): void {
        const checked = (event.target as HTMLInputElement).checked;

        this.checked.set(checked);
        this.onChange(checked);
        this.changed.emit(checked);
    }

    protected onBlur(): void {
        this.onTouched();
    }
}
