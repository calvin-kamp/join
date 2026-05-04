import { Routes } from '@angular/router';
import { ContactDetailComponent } from './contact-detail/contact-detail.component';
import { ContactsComponent } from './contacts/contacts.component';

export const CONTACTS_ROUTES: Routes = [
    {
        path: '',
        component: ContactsComponent,
        children: [
            {
                path: ':id',
                component: ContactDetailComponent
            }
        ]
    }
];
