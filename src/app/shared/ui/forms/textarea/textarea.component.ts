import { ChangeDetectionStrategy, Component, computed, forwardRef, input, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

/** Multi-line text field with label, required mark and error message. */
@Component({
    selector: 'ui-textarea',
    imports: [],
    templateUrl: './textarea.component.html',
    styleUrl: './textarea.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TextareaComponent),
            multi: true
        }
    ]
})
export class TextareaComponent {
    /** Label text; also the placeholder if none is set. */
    label = input.required<string>();

    /** Name attribute; also used to build the element id. */
    name = input.required<string>();

    placeholder = input<string>('');

    /** Error text below the field; a non-empty text marks it invalid. */
    errorMessage = input<string>('');

    /** Sets `aria-required` and shows the required mark. */
    isRequired = input<boolean>(false);

    /** `false` keeps the label for screen readers only. */
    labelVisible = input<boolean>(true);

    /** Stretches the field to the full width. */
    fullWidth = input<boolean>(false);

    protected readonly value = signal('');
    protected readonly isDisabled = signal(false);

    protected readonly textareaId = computed(() => `ui-textarea-${this.name()}`);
    protected readonly hasError = computed(() => this.errorMessage().length > 0);
    protected readonly effectivePlaceholder = computed(() => this.placeholder() || this.label());

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
    }
}
