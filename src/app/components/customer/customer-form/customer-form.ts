import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CustomerService } from '../../../services/customer.service';
import { Customer } from '../../../models/customer.model';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-form.html',
  styleUrls: ['./customer-form.css']
})
export class CustomerForm implements OnInit, OnChanges {
  @Input() editId = 0;
  form!: FormGroup;  

  constructor(private fb: FormBuilder, private cs: CustomerService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      customerId: [0],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      street: ['', Validators.required],
      zipCode: [Validators.required],
      city: ['', Validators.required],
      newsletter: [false]
    });

    if (this.editId > 0) {
      this.loadCustomer(this.editId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editId'] && this.form) {
      const id = changes['editId'].currentValue;
      if (id > 0) {
        this.loadCustomer(id);
      } else {
        this.form.reset({ customerId: 0, newsletter: false });
      }
    }
  }

  private loadCustomer(id: number): void {
    this.cs.getCustomerById(id).subscribe(c => {
      if (c) {
        this.form.patchValue(c);
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;
  
    const formValue = this.form.value;
    const { customerId, ...customerData } = formValue;
    const newCustomer = customerData as Omit<Customer, 'customerId'>;
  
    if (customerId === 0) {
      this.cs.addCustomer(newCustomer).subscribe({
        next: (created) => {
          console.log('Kunde erstellt:', created);
          alert('Kunde gespeichert');
          this.form.reset({ customerId: 0, newsletter: false });
        },
        error: (err) => {
          console.error('Fehler beim Erstellen:', err);
          alert('Fehler beim Speichern');
        }
      });
    } else {
      // UPDATE
      this.cs.updateCustomer(formValue as Customer).subscribe({
        next: () => {
          console.log('Kunde aktualisiert');
          alert('Kunde aktualisiert');
          this.form.reset({ customerId: 0, newsletter: false });
        },
        error: (err) => {
          console.error('Fehler beim Aktualisieren:', err);
          alert('Fehler beim Aktualisieren');
        }
      });
    }
  }
}
