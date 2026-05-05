import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '@core/supabase/supabase.service';
import { type Session, type User, type AuthError, type AuthTokenResponsePassword } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private supabase = inject(SupabaseService).client;
    private router = inject(Router);

    private session = signal<Session | null>(null);
    readonly user = computed<User | null>(() => this.session()?.user ?? null);
    readonly isLoggedIn = computed<boolean>(() => this.session() !== null);

    readonly displayName = computed<string>(() => {
        const user = this.user();

        if (!user) {
            return 'Guest';
        }

        const metaName = user.user_metadata?.['name'];

        if (metaName) {
            return metaName;
        }
    });

    constructor() {
        this.supabase.auth.getSession().then(({ data }) => this.session.set(data.session));
        this.supabase.auth.onAuthStateChange((_event, session) => this.session.set(session));
    }

    signIn(email: string, password: string): Promise<AuthTokenResponsePassword> {
        return this.supabase.auth.signInWithPassword({ email, password });
    }

    async signUp(email: string, password: string, name: string): Promise<void> {
        const { error } = await this.supabase.auth.signUp({
            email,
            password,
            options: { data: { name } }
        });

        if (error) throw error;
    }

    async signOut(): Promise<{ error: AuthError | null }> {
        const result = await this.supabase.auth.signOut();

        await this.router.navigateByUrl('/');

        return result;
    }
}
