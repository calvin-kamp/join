import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { CardDirective } from '@shared/directives/card.directive';
import { controlErrorMessage } from '@shared/forms/control-error-message';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { InputComponent } from '@shared/ui/forms/input/input.component';
import { IconComponent } from '@shared/ui/icon/icon.component';

@Component({
    selector: 'auth-login',
    imports: [ReactiveFormsModule, CardDirective, InputComponent, ButtonComponent, IconComponent],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private auth = inject(AuthService);
    private router = inject(Router);

    loading = signal<boolean>(false);
    error = signal<string | null>(null);
    showPassword = signal<boolean>(false);

    logInForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
    });

    protected emailError = controlErrorMessage(this.logInForm.controls.email, {
        required: 'Email is required',
        email: 'Please enter a valid email address'
    });

    protected passwordError = controlErrorMessage(this.logInForm.controls.password, {
        required: 'Password is required',
        minlength: 'Must be at least 6 characters'
    });

    async onSubmit(): Promise<void> {
        this.logInForm.markAllAsTouched();

        if (this.logInForm.invalid) {
            return;
        }

        this.loading.set(true);
        this.error.set(null);

        try {
            const { email, password } = this.logInForm.getRawValue();
            const { error } = await this.auth.signIn(email!, password!);

            if (error) {
                throw error;
            }

            await this.router.navigateByUrl('/summary');
        } catch {
            this.error.set('Login failed.');
        } finally {
            this.loading.set(false);
        }
    }

    continueAsGuest(): void {
        this.auth.signIn('guest@guest.test', 'guest@guest.test');
        this.router.navigateByUrl('/summary');
    }

    togglePassword(): void {
        this.showPassword.set(!this.showPassword());
    }
}
