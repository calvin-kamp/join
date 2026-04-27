import { computed, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';

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
