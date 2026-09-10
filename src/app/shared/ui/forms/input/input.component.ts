import { ChangeDetectionStrategy, Component, computed, forwardRef, input, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '@shared/ui/icon/icon.component';

type InputType = 'text' | 'email' | 'password' | 'tel';

/**
 * Text input with label, required mark and error message.
 *
 * Projected content (e.g. an icon) is placed inside the field. With
 * `showActions` it shows clear/confirm buttons and emits `confirmed` instead
 * of keeping the value (used for adding subtasks).
 */
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
    /** Label text; also the placeholder if none is set. */
    label = input<string>('');

    /** Name attribute; also used to build the element id. */
    name = input<string>('');

    type = input<InputType>('text');
    placeholder = input<string>('');

    /** Error text below the field; a non-empty text marks it invalid. */
    errorMessage = input<string>('');

    /** Sets `aria-required` and shows the required mark. */
    isRequired = input<boolean>(false);

    /** `false` keeps the label for screen readers only. */
    labelVisible = input<boolean>(true);

    /** Stretches the field to the full width. */
    fullWidth = input<boolean>(false);

    /** Shows clear/confirm buttons while the field has a value. */
    showActions = input<boolean>(false);

    /** Emits the trimmed value on confirm; the field is cleared afterwards. */
    confirmed = output<string>();

    /** Emits after the clear button was used. */
    cleared = output<void>();

    /** Emits when the field loses focus. */
    blurred = output<void>();

    protected readonly value = signal('');
    protected readonly isDisabled = signal(false);

    protected readonly inputId = computed(() => `ui-input-${this.name()}`);
    protected readonly hasError = computed(() => this.errorMessage().length > 0);
    protected readonly effectivePlaceholder = computed(() => this.placeholder() || this.label());
    protected readonly hasValue = computed(() => this.value().trim().length > 0);

    private onChange = (_: string) => {};
    private onTouched = () => {};

    /** Called by the forms API to set the value. */
    writeValue(value: string): void {
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

    /** Emits the trimmed value and clears the field; ignores empty input. */
    protected onConfirm(): void {
        const val = this.value().trim();
        if (!val) return;
        this.confirmed.emit(val);
        this.value.set('');
        this.onChange('');
    }

    /** Clears the field. */
    protected onClear(): void {
        this.value.set('');
        this.onChange('');
        this.cleared.emit();
    }
}
