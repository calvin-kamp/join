import { ChangeDetectionStrategy, Component, computed, forwardRef, input, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '@shared/ui/icon/icon.component';

type InputType = 'text' | 'email' | 'password' | 'tel';

@Component({
    selector: 'ui-input',
    imports: [IconComponent],
    templateUrl: './input.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputComponent),
            multi: true
        }
    ]
})
export class InputComponent implements ControlValueAccessor {
    label = input<string>('');
    name = input<string>('');

    type = input<InputType>('text');
    placeholder = input<string>('');
    errorMessage = input<string>('');
    isRequired = input<boolean>(false);
    labelVisible = input<boolean>(true);
    fullWidth = input<boolean>(false);
    showActions = input<boolean>(false);

    confirmed = output<string>();
    cleared = output<void>();

    blurred = output<void>();

    protected readonly value = signal('');
    protected readonly isDisabled = signal(false);

    protected readonly inputId = computed(() => `ui-input-${this.name()}`);
    protected readonly hasError = computed(() => this.errorMessage().length > 0);
    protected readonly effectivePlaceholder = computed(() => this.placeholder() || this.label());
    protected readonly hasValue = computed(() => this.value().trim().length > 0);

    private onChange = (_: string) => {};
    private onTouched = () => {};

    writeValue(value: string): void {
        this.value.set(value ?? '');
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(d: boolean): void {
        this.isDisabled.set(d);
    }

    protected onInput(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.value.set(value);
        this.onChange(value);
    }

    protected onBlur(): void {
        this.onTouched();
        this.blurred.emit();
    }

    protected onConfirm(): void {
        const val = this.value().trim();
        if (!val) return;
        this.confirmed.emit(val);
        this.value.set('');
        this.onChange('');
    }

    protected onClear(): void {
        this.value.set('');
        this.onChange('');
        this.cleared.emit();
    }
}
