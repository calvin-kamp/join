import { ChangeDetectionStrategy, Component, computed, forwardRef, input, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

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
    label = input.required<string>();
    name = input.required<string>();

    placeholder = input<string>('');
    errorMessage = input<string>('');
    isRequired = input<boolean>(false);
    labelVisible = input<boolean>(true);

    protected readonly value = signal('');
    protected readonly isDisabled = signal(false);

    protected readonly textareaId = computed(() => `ui-textarea-${this.name()}`);
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
    }
}
