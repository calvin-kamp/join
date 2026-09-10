import { computed, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';

/**
 * Creates a signal with the error text for a form control.
 *
 * The text is empty until the control is touched. After that it is the text
 * of the first error key that has an entry in `messages`. The signal updates
 * on value, status and touched changes, including `markAllAsTouched()`.
 *
 * Must be called in an injection context (e.g. a field initializer).
 *
 * @param control - The control to watch.
 * @param messages - Error key → text, e.g. `{ required: 'Title is required' }`.
 *
 * @example
 * ```ts
 * titleError = controlErrorMessage(this.form.controls.title, { required: 'Title is required' });
 * ```
 */
export function controlErrorMessage(control: AbstractControl, messages: Record<string, string>): Signal<string> {
    const status = toSignal(control.statusChanges, { initialValue: control.status });
    const events = toSignal(control.events, { initialValue: null });

    return computed(() => {
        status();
        events();

        if (!control.touched || !control.errors) {
            return '';
        }

        for (const key of Object.keys(control.errors)) {
            if (messages[key]) {
                return messages[key];
            }
        }
        return '';
    });
}
