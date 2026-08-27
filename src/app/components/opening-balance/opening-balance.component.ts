import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { OpeningBalanceService, OpeningBalanceRecord } from '../../services/opening-balance.service';
import { AccountInfoService, AccountInfo } from '../../services/account-info.service';

@Component({
  selector: 'app-opening-balance',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './opening-balance.component.html',
  styleUrls: ['./opening-balance.component.scss']
})
export class OpeningBalanceComponent implements OnInit {
  records: OpeningBalanceRecord[] = [];
  filteredRecords: OpeningBalanceRecord[] = [];
  accounts: AccountInfo[] = [];
  showForm: boolean = false;
  isEditMode: boolean = false;
  editId: number | null = null;
  loading: boolean = false;
  error: string = '';
  success: string = '';
  searchTerm: string = '';
  existingBalance: number | null = null;
  existingBalanceType: string | null = null;
  selectedAccountName: string = '';

  openingBalanceForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private openingBalanceService: OpeningBalanceService,
    private accountService: AccountInfoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
    this.loadAccounts();
    // Listen for account selection changes to load existing balance
    this.openingBalanceForm.get('AccountID')?.valueChanges.subscribe(accountId => {
      if (accountId) {
        this.loadAccountBalance(accountId);
      }
    });
  }

  loadAccountBalance(accountId: number): void {
    // Reset existing balance while loading
    this.existingBalance = null;
    this.existingBalanceType = null;
    
    this.accountService.getAccount(accountId).subscribe({
      next: (response) => {
        console.log('Account data:', response);
        if (response.success && response.data) {
          const account = response.data;
          // If account has existing opening balance, show it
          const balance = account.OpeningBalance;
          if (balance !== undefined && balance !== null && balance !== 0) {
            // Only update form if not in edit mode (edit mode has its own data)
            if (!this.isEditMode) {
              this.openingBalanceForm.patchValue({
                OpeningBalance: balance,
                BalanceType: account.BalanceType || 'Dr'
              }, { emitEvent: false });
            }
            // Show existing balance info below the field
            this.existingBalance = balance;
            this.existingBalanceType = account.BalanceType || 'Dr';
          } else {
            this.existingBalance = null;
            this.existingBalanceType = null;
          }
        }
      },
      error: (err) => {
        console.error('Failed to load account balance:', err);
        this.error = 'Could not load account balance';
        setTimeout(() => this.error = '', 3000);
      }
    });
  }

  initForm(): void {
    this.openingBalanceForm = this.fb.group({
      AccountID: ['', [Validators.required]],
      BalanceType: ['Dr', [Validators.required]],
      OpeningBalance: [0, [Validators.required, Validators.min(0)]],
      FinancialYear: ['2025-2026', [Validators.required]]
    });
  }

  loadData(): void {
    this.loading = true;
    this.openingBalanceService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.records = response.data || [];
          this.applyFilter();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load opening balance records';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadAccounts(): void {
    this.accountService.getAccounts().subscribe({
      next: (response) => {
        if (response.success) {
          this.accounts = response.data || [];
        }
      },
      error: (err) => {
        console.error('Failed to load accounts:', err);
      }
    });
  }

  toggleForm(): void {
    if (this.showForm) {
      this.showForm = false;
      this.isEditMode = false;
      this.editId = null;
      this.openingBalanceForm.reset({ BalanceType: 'Dr', OpeningBalance: 0, FinancialYear: '2025-2026' });
    } else {
      this.showForm = true;
      this.isEditMode = false;
      this.editId = null;
      this.openingBalanceForm.reset({ BalanceType: 'Dr', OpeningBalance: 0, FinancialYear: '2025-2026' });
    }
  }

  onSubmit(): void {
    if (this.openingBalanceForm.invalid) {
      Object.keys(this.openingBalanceForm.controls).forEach(key => {
        const control = this.openingBalanceForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const formData = this.openingBalanceForm.value;

    if (this.isEditMode && this.editId) {
      this.openingBalanceService.update(this.editId, formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Opening balance updated successfully!';
            this.loadData();
            this.toggleForm();
            setTimeout(() => this.success = '', 3000);
          }
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to update opening balance';
          console.error(err);
          setTimeout(() => this.error = '', 3000);
        }
      });
    } else {
      this.openingBalanceService.create(formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Opening balance created successfully!';
            this.loadData();
            this.toggleForm();
            setTimeout(() => this.success = '', 3000);
          }
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to create opening balance';
          console.error(err);
          setTimeout(() => this.error = '', 3000);
        }
      });
    }
  }

  editRecord(record: OpeningBalanceRecord): void {
    if (record.IsPosted) {
      this.error = 'Cannot edit a posted record';
      setTimeout(() => this.error = '', 3000);
      return;
    }
    this.editId = record.OpeningBalanceID || null;
    this.isEditMode = true;
    this.showForm = true;
    this.openingBalanceForm.patchValue({
      AccountID: record.AccountID,
      BalanceType: record.BalanceType,
      OpeningBalance: record.OpeningBalance,
      FinancialYear: record.FinancialYear
    });
  }

  deleteRecord(id: number): void {
    const record = this.records.find(r => r.OpeningBalanceID === id);
    if (record?.IsPosted) {
      this.error = 'Cannot delete a posted record';
      setTimeout(() => this.error = '', 3000);
      return;
    }
    if (confirm('Are you sure you want to delete this opening balance record?')) {
      this.openingBalanceService.delete(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Record deleted successfully!';
            this.loadData();
            setTimeout(() => this.success = '', 3000);
          }
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to delete record';
          console.error(err);
          setTimeout(() => this.error = '', 3000);
        }
      });
    }
  }

  postRecord(id: number): void {
    const record = this.records.find(r => r.OpeningBalanceID === id);
    if (record?.IsPosted) {
      this.error = 'Record is already posted';
      setTimeout(() => this.error = '', 3000);
      return;
    }
    if (confirm('Are you sure you want to post this opening balance record? This action cannot be undone.')) {
      this.openingBalanceService.postRecord(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Opening balance posted successfully!';
            this.loadData();
            setTimeout(() => this.success = '', 3000);
          }
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to post record';
          console.error(err);
          setTimeout(() => this.error = '', 3000);
        }
      });
    }
  }

  applyFilter(event?: any): void {
    if (event) {
      this.searchTerm = event.target.value.toLowerCase().trim();
    }
    if (!this.searchTerm) {
      this.filteredRecords = [...this.records];
      return;
    }
    this.filteredRecords = this.records.filter(r =>
      (r.AccountCode && r.AccountCode.toLowerCase().includes(this.searchTerm)) ||
      (r.AccountName && r.AccountName.toLowerCase().includes(this.searchTerm)) ||
      (r.GroupName && r.GroupName.toLowerCase().includes(this.searchTerm)) ||
      (r.FinancialYear && r.FinancialYear.toLowerCase().includes(this.searchTerm))
    );
  }

  selectedRowId: number | null = null;

  selectRow(id: number): void {
    this.selectedRowId = this.selectedRowId === id ? null : id;
  }

  onEdit(): void {
    if (!this.selectedRowId) return;
    const record = this.records.find(r => r.OpeningBalanceID === this.selectedRowId);
    if (record) {
      this.editRecord(record);
    }
  }

  deleteSelected(): void {
    if (!this.selectedRowId) return;
    this.deleteRecord(this.selectedRowId);
  }

  postSelected(): void {
    if (!this.selectedRowId) return;
    this.postRecord(this.selectedRowId);
  }

  onPrint(): void {
    window.print();
  }

  onClose(): void {
    this.showForm = false;
    this.isEditMode = false;
    this.editId = null;
    this.selectedRowId = null;
    this.openingBalanceForm.reset({ BalanceType: 'Dr', OpeningBalance: 0, FinancialYear: '2025-2026' });
    this.router.navigate(['/dashboard']);
  }

  get postedCount(): number {
    return this.records.filter(r => r.IsPosted).length;
  }

  get pendingCount(): number {
    return this.records.filter(r => !r.IsPosted).length;
  }
}

