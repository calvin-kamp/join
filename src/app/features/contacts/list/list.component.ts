import { Component, inject } from '@angular/core';
import { ContactsService } from '../contacts.service';
import { JsonPipe } from '@angular/common';
import { ItemComponent } from './item/item.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { Router } from '@angular/router';

@Component({
    selector: 'contacts-list',
    imports: [JsonPipe, ItemComponent, ButtonComponent],
    templateUrl: './list.component.html',
    styleUrl: './list.component.scss'
})
export class ListComponent {
    list = inject(ContactsService);
    private router = inject(Router);

    ngOnInit() {
        this.list.getContacts();
    }

    sortedContacts() {
        return this.list.contacts().sort((a: any, b: any) => a.name.localeCompare(b.name));
    }

    continueToContact(): void {
        this.router.navigateByUrl('/summary');
    }

    getcard(index: number) {
        console.log(index);
    }
}
