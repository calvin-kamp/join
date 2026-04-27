import { Component, inject } from '@angular/core';
import { ContactsService } from '../contacts.service';
import { JsonPipe } from '@angular/common';
import { ItemComponent } from './item/item.component';


@Component({
  selector: 'contacts-list',
  imports: [JsonPipe, ItemComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent {
  list = inject(ContactsService);

  ngOnInit() {
    this.list.getContacts()
  }

  sortedContacts() {
    return this.list.contacts().sort((a: any, b: any) => a.name.localeCompare(b.name));
  }
}
