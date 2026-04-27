import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { CardDirective } from '@shared/directives/card.directive';
import { controlErrorMessage } from '@shared/forms/control-error-message';
import { passwordMatchValidator } from '@shared/forms/password-match.validator';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { InputComponent } from '@shared/ui/forms/input/input.component';

@Component({
    selector: 'auth-register',
    imports: [CardDirective, InputComponent, ReactiveFormsModule, ButtonComponent],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
    private fb = inject(FormBuilder);
    private auth = inject(AuthService);
    private router = inject(Router);

    loading = signal<boolean>(false);
    error = signal<string | null>(null);

    registerForm = this.fb.group(
        {
            name: ['', [Validators.required, Validators.minLength(4)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required]
        },
        { validators: passwordMatchValidator() }
    );

    protected nameError = controlErrorMessage(this.registerForm.controls.name, {
        required: 'Name is required',
        minlength: 'Must be at least 4 characters'
    });

    protected emailError = controlErrorMessage(this.registerForm.controls.email, {
        required: 'Email is required',
        email: 'Please enter a valid email address'
    });

    protected passwordError = controlErrorMessage(this.registerForm.controls.password, {
        required: 'Password is required',
        minlength: 'Must be at least 6 characters'
    });

    private confirmFieldError = controlErrorMessage(this.registerForm.controls.confirmPassword, {
        required: 'Please confirm your password'
    });

    private formStatus = toSignal(this.registerForm.statusChanges, {
        initialValue: this.registerForm.status
    });

    protected passwordConfirmError = computed(() => {
        const fieldErr = this.confirmFieldError();

        if (fieldErr) {
            return fieldErr;
        }

        this.formStatus();

        if (this.registerForm.controls.confirmPassword.touched && this.registerForm.errors?.['passwordMismatch']) {
            return 'Passwords do not match';
        }

        return '';
    });

    async onSubmit(): Promise<void> {
        this.registerForm.markAllAsTouched();

        if (this.registerForm.invalid) {
            return;
        }

        this.loading.set(true);
        this.error.set(null);

        try {
            const { email, password } = this.registerForm.getRawValue();

            await this.auth.signUp(email!, password!);
            await this.router.navigateByUrl('/summary');
        } catch {
            this.error.set('Registration failed.');
        } finally {
            this.loading.set(false);
        }
    }
}
