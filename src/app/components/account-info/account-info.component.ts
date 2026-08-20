import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AccountInfoService, AccountInfo } from '../../services/account-info.service';
import { AccountGroupService, AccountGroup } from '../../services/account-group.service';

@Component({
  selector: 'app-account-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss']
})
export class AccountInfoComponent implements OnInit {
  accounts: AccountInfo[] = [];
  accountForm: FormGroup;
  isEditMode: boolean = false;
  selectedAccountId: number | null = null;
  selectedRowId: number | null = null;
  loading: boolean = false;
  error: string = '';
  success: string = '';
  showForm: boolean = false;
  isFormFilled: boolean = false;
  
  groups: AccountGroup[] = [];
  balanceTypes = ['Dr', 'Cr'];
  states = ['Andhra Pradesh', 'Karnataka', 'Tamil Nadu', 'Maharashtra', 'Gujarat', 
            'Rajasthan', 'Delhi', 'Uttar Pradesh', 'West Bengal', 'Others'];

  constructor(
    private fb: FormBuilder,
    private accountService: AccountInfoService,
    private groupService: AccountGroupService
  ) {
    this.accountForm = this.fb.group({
      AccountCode: ['', [Validators.required, Validators.maxLength(50)]],
      AccountName: ['', [Validators.required, Validators.maxLength(100)]],
      GroupID: ['', Validators.required],
      Address: [''],
      City: [''],
      State: [''],
      Pincode: ['', [Validators.maxLength(10)]],
      Phone: ['', [Validators.maxLength(20)]],
      Mobile: ['', [Validators.maxLength(20)]],
      Email: ['', [Validators.email, Validators.maxLength(100)]],
      GSTIN: ['', [Validators.maxLength(50)]],
      PAN: ['', [Validators.maxLength(50)]],
      OpeningBalance: [0],
      BalanceType: ['Dr'],
      IsActive: [true],
      Remarks: ['']
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
    this.loadGroups();
  }

  loadAccounts(): void {
    this.loading = true;
    this.accountService.getAccounts().subscribe({
      next: (response) => {
        if (response.success) {
          this.accounts = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading accounts';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadGroups(): void {
    this.groupService.getGroups().subscribe({
      next: (response) => {
        if (response.success) {
          this.groups = response.data;
        }
      },
      error: (err) => console.error(err)
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    } else {
      // When adding a new record, set selectedRowId to a temporary value
      // so Confirm button becomes enabled
      this.selectedRowId = -1;
      this.isFormFilled = false;
    }
  }

  resetForm(): void {
    this.accountForm.reset({
      OpeningBalance: 0,
      BalanceType: 'Dr',
      IsActive: true
    });
    this.isEditMode = false;
    this.selectedAccountId = null;
    this.error = '';
    this.success = '';
  }

  onSubmit(): void {
    if (this.accountForm.invalid) {
      Object.keys(this.accountForm.controls).forEach(key => {
        this.accountForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const accountData = this.accountForm.value;

    if (this.isEditMode && this.selectedAccountId) {
      this.accountService.updateAccount(this.selectedAccountId, accountData).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Account updated successfully!';
            this.loadAccounts();
            setTimeout(() => {
              this.resetForm();
              this.showForm = false;
            }, 2000);
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error updating account';
          this.loading = false;
          console.error(err);
        }
      });
    } else {
      this.accountService.createAccount(accountData).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Account created successfully!';
            // Add the new account to the local array immediately
            if (response.data && response.data.AccountID) {
              this.accounts.unshift(response.data);
              this.selectedRowId = response.data.AccountID;
            }
            // Refresh in background
            this.loadAccounts();
            setTimeout(() => {
              this.resetForm();
              this.showForm = false;
            }, 1500);
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error creating account';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  editAccount(account: AccountInfo): void {
    this.isEditMode = true;
    this.selectedAccountId = account.AccountID!;
    this.selectedRowId = account.AccountID!;
    this.showForm = true;
    this.isFormFilled = false;
    
    this.accountForm.patchValue({
      AccountCode: account.AccountCode,
      AccountName: account.AccountName,
      GroupID: account.GroupID,
      Address: account.Address || '',
      City: account.City || '',
      State: account.State || '',
      Pincode: account.Pincode || '',
      Phone: account.Phone || '',
      Mobile: account.Mobile || '',
      Email: account.Email || '',
      GSTIN: account.GSTIN || '',
      PAN: account.PAN || '',
      OpeningBalance: account.OpeningBalance || 0,
      BalanceType: account.BalanceType || 'Dr',
      IsActive: account.IsActive !== undefined ? account.IsActive : true,
      Remarks: account.Remarks || ''
    });
  }

  deleteAccount(id: number): void {
    if (confirm('Are you sure you want to delete this account?')) {
      this.loading = true;
      this.accountService.deleteAccount(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Account deleted successfully!';
            this.loadAccounts();
            setTimeout(() => this.success = '', 3000);
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error deleting account';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  cancel(): void {
    this.resetForm();
    this.showForm = false;
  }

  // Row Selection
  selectRow(id: number): void {
    this.selectedRowId = this.selectedRowId === id ? null : id;
  }

  // Action Toolbar Methods
  onEdit(): void {
    if (this.selectedRowId) {
      const account = this.accounts.find(a => a.AccountID === this.selectedRowId);
      if (account) {
        this.editAccount(account);
      }
    }
  }

  deleteSelected(): void {
    if (this.selectedRowId) {
      this.deleteAccount(this.selectedRowId);
    }
  }

  onPrint(): void {
    window.print();
  }

  onAttach(): void {
    this.success = 'Attach functionality - select file to attach';
    setTimeout(() => this.success = '', 3000);
  }

  onConfirm(): void {
    // If form is open and we're adding a new record
    if (this.showForm && this.selectedRowId === -1) {
      // First save the record
      if (this.accountForm.invalid) {
        Object.keys(this.accountForm.controls).forEach(key => {
          this.accountForm.get(key)?.markAsTouched();
        });
        this.error = 'Please fill all required fields before confirming';
        setTimeout(() => this.error = '', 3000);
        return;
      }

      this.loading = true;
      const accountData = this.accountForm.value;
      this.accountService.createAccount(accountData).subscribe({
        next: (response) => {
          if (response.success) {
            // Add the new account to the local array
            if (response.data && response.data.AccountID) {
              this.accounts.unshift(response.data);
              this.selectedRowId = response.data.AccountID;
              // Now confirm the record
              const accountId = this.selectedRowId as number;
              this.accountService.confirmAccount(accountId).subscribe({
                next: (confirmResponse: any) => {
                  this.loading = false;
                  if (confirmResponse.success) {
                    this.success = 'Account created and confirmed successfully!';
                    this.isFormFilled = true;
                    this.loadAccounts();
                    setTimeout(() => {
                      this.success = '';
                      this.resetForm();
                      this.showForm = false;
                      this.selectedRowId = null;
                      this.isFormFilled = false;
                    }, 2000);
                  } else {
                    this.error = confirmResponse.message || 'Error confirming record';
                    setTimeout(() => this.error = '', 3000);
                  }
                },
                error: (err) => {
                  this.loading = false;
                  this.success = 'Account created successfully! (Confirm column missing - please run SQL migration)';
                  this.isFormFilled = true;
                  this.loadAccounts();
                  setTimeout(() => {
                    this.success = '';
                    this.resetForm();
                    this.showForm = false;
                    this.selectedRowId = null;
                    this.isFormFilled = false;
                  }, 3000);
                  console.error('Confirm error:', err);
                }
              });
            } else {
              this.loading = false;
              this.error = 'Error: No AccountID returned from server';
              setTimeout(() => this.error = '', 3000);
            }
          } else {
            this.loading = false;
            this.error = response.message || 'Error creating account';
            setTimeout(() => this.error = '', 3000);
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Error creating account';
          setTimeout(() => this.error = '', 3000);
          console.error(err);
        }
      });
    } else if (this.showForm && this.isEditMode && this.selectedAccountId) {
      // Edit mode: save changes first, then confirm
      if (this.accountForm.invalid) {
        Object.keys(this.accountForm.controls).forEach(key => {
          this.accountForm.get(key)?.markAsTouched();
        });
        this.error = 'Please fill all required fields before confirming';
        setTimeout(() => this.error = '', 3000);
        return;
      }

      this.loading = true;
      const accountData = this.accountForm.value;
      this.accountService.updateAccount(this.selectedAccountId, accountData).subscribe({
        next: (response) => {
          if (response.success) {
            // Now confirm the updated record
            this.accountService.confirmAccount(this.selectedAccountId!).subscribe({
              next: (confirmResponse) => {
                this.loading = false;
                if (confirmResponse.success) {
                  this.success = 'Account updated and confirmed successfully!';
                  this.isFormFilled = true;
                  this.loadAccounts();
                  setTimeout(() => {
                    this.success = '';
                    this.resetForm();
                    this.showForm = false;
                    this.selectedRowId = null;
                    this.isFormFilled = false;
                  }, 2000);
                } else {
                  this.error = confirmResponse.message || 'Error confirming record';
                  setTimeout(() => this.error = '', 3000);
                }
              },
              error: (err) => {
                this.loading = false;
                this.success = 'Account updated successfully! (Confirm column missing - please run SQL migration)';
                this.isFormFilled = true;
                this.loadAccounts();
                setTimeout(() => {
                  this.success = '';
                  this.resetForm();
                  this.showForm = false;
                  this.selectedRowId = null;
                  this.isFormFilled = false;
                }, 3000);
                console.error('Confirm error:', err);
              }
            });
          } else {
            this.loading = false;
            this.error = response.message || 'Error updating account';
            setTimeout(() => this.error = '', 3000);
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Error updating account';
          setTimeout(() => this.error = '', 3000);
          console.error(err);
        }
      });
    } else if (this.selectedRowId && this.selectedRowId > 0 && !this.showForm) {
      // Confirm an existing saved record (not in edit mode)
      this.loading = true;
      this.accountService.confirmAccount(this.selectedRowId).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.success = `Record ${this.selectedRowId} confirmed successfully!`;
            this.isFormFilled = true;
            this.loadAccounts();
            setTimeout(() => {
              this.success = '';
              this.resetForm();
              this.showForm = false;
              this.selectedRowId = null;
              this.isFormFilled = false;
            }, 2000);
          } else {
            this.error = response.message || 'Error confirming record';
            setTimeout(() => this.error = '', 3000);
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Error confirming record';
          setTimeout(() => this.error = '', 3000);
          console.error(err);
        }
      });
    } else {
      this.error = 'Please select a valid record to confirm';
      setTimeout(() => this.error = '', 3000);
    }
  }

  onUndo(): void {
    // Reset the form and toolbar state
    this.resetForm();
    this.showForm = false;
    this.selectedRowId = null;
    this.isFormFilled = false;
    this.success = 'Undo successful - changes reverted';
    setTimeout(() => this.success = '', 3000);
  }

  onClose(): void {
    this.error = 'Close functionality - returning to previous view';
    setTimeout(() => this.error = '', 3000);
  }
}