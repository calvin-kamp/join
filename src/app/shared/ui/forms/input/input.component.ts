import { ChangeDetectionStrategy, Component, computed, forwardRef, input, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type InputType = 'text' | 'email' | 'password' | 'tel';

@Component({
    selector: 'ui-input',
    imports: [],
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
    label = input.required<string>();
    name = input.required<string>();

    type = input<InputType>('text');
    placeholder = input<string>('');
    errorMessage = input<string>('');
    isRequired = input<boolean>(false);
    labelVisible = input<boolean>(true);

    blurred = output<void>();

    protected readonly value = signal('');
    protected readonly isDisabled = signal(false);

    protected readonly inputId = computed(() => `ui-input-${this.name()}`);
    protected readonly hasError = computed(() => this.errorMessage().length > 0);
    protected readonly effectivePlaceholder = computed(() => this.placeholder() || this.label());

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
}
