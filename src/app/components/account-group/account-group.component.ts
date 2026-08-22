import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AccountGroupService, AccountGroup } from '../../services/account-group.service';

@Component({
  selector: 'app-account-group',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './account-group.component.html',
  styleUrls: ['./account-group.component.scss']
})
export class AccountGroupComponent implements OnInit {
  groups: AccountGroup[] = [];
  filteredGroups: AccountGroup[] = [];
  searchTerm: string = '';
  groupForm: FormGroup;
  isEditMode: boolean = false;
  selectedGroupId: number | null = null;
  selectedRowId: number | null = null;
  loading: boolean = false;
  error: string = '';
  success: string = '';
  showForm: boolean = false;
  isFormFilled: boolean = false; // Track if form is filled and confirmed
  
  // Dropdown options
  groupTypes = ['Assets', 'Liabilities', 'Income', 'Expenses', 'Equity'];
  natureOfAccount = ['Debit', 'Credit'];
  parentGroups: AccountGroup[] = [];

  constructor(
    private fb: FormBuilder,
    private groupService: AccountGroupService
  ) {
    this.groupForm = this.fb.group({
      GroupCode: ['', [Validators.required, Validators.maxLength(50)]],
      GroupName: ['', [Validators.required, Validators.maxLength(100)]],
      ParentGroupID: [null],
      GroupType: ['', Validators.required],
      NatureOfAccount: ['', Validators.required],
      OpeningBalance: [0],
      IsActive: [true],
      Remarks: ['']
    });
  }

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.loading = true;
    this.groupService.getGroups().subscribe({
      next: (response) => {
        if (response.success) {
          this.groups = response.data;
          this.parentGroups = response.data;
          this.applyFilter();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading groups';
        this.loading = false;
        console.error(err);
      }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredGroups = this.groups;
      return;
    }
    this.filteredGroups = this.groups.filter(group =>
      group.GroupCode?.toLowerCase().includes(term) ||
      group.GroupName?.toLowerCase().includes(term)
    );
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
    this.groupForm.reset({
      OpeningBalance: 0,
      IsActive: true
    });
    this.isEditMode = false;
    this.selectedGroupId = null;
    this.error = '';
    this.success = '';
  }

  onSubmit(): void {
    if (this.groupForm.invalid) {
      Object.keys(this.groupForm.controls).forEach(key => {
        this.groupForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const groupData = this.groupForm.value;

    if (this.isEditMode && this.selectedGroupId) {
      this.groupService.updateGroup(this.selectedGroupId, groupData).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Group updated successfully!';
            this.loadGroups();
            setTimeout(() => {
              this.resetForm();
              this.showForm = false;
            }, 2000);
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error updating group';
          this.loading = false;
          console.error(err);
        }
      });
    } else {
      this.groupService.createGroup(groupData).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Group created successfully!';
            // Add the new group to the local array immediately
            if (response.data && response.data.GroupID) {
              this.groups.unshift(response.data);
              this.parentGroups.unshift(response.data);
              this.selectedRowId = response.data.GroupID;
            }
            // Refresh in background
            this.loadGroups();
            setTimeout(() => {
              this.resetForm();
              this.showForm = false;
            }, 1500);
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error creating group';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  editGroup(group: AccountGroup): void {
    this.isEditMode = true;
    this.selectedGroupId = group.GroupID!;
    this.selectedRowId = group.GroupID!;
    this.showForm = true;
    this.isFormFilled = false;
    
    this.groupForm.patchValue({
      GroupCode: group.GroupCode,
      GroupName: group.GroupName,
      ParentGroupID: group.ParentGroupID || null,
      GroupType: group.GroupType,
      NatureOfAccount: group.NatureOfAccount,
      OpeningBalance: group.OpeningBalance || 0,
      IsActive: group.IsActive !== undefined ? group.IsActive : true,
      Remarks: group.Remarks || ''
    });
  }

  deleteGroup(id: number): void {
    if (confirm('Are you sure you want to delete this group?')) {
      this.loading = true;
      this.groupService.deleteGroup(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Group deleted successfully!';
            this.loadGroups();
            setTimeout(() => this.success = '', 3000);
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error deleting group';
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
      const group = this.groups.find(g => g.GroupID === this.selectedRowId);
      if (group) {
        this.editGroup(group);
      }
    }
  }

  deleteSelected(): void {
    if (this.selectedRowId) {
      this.deleteGroup(this.selectedRowId);
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
      if (this.groupForm.invalid) {
        Object.keys(this.groupForm.controls).forEach(key => {
          this.groupForm.get(key)?.markAsTouched();
        });
        this.error = 'Please fill all required fields before confirming';
        setTimeout(() => this.error = '', 3000);
        return;
      }

      this.loading = true;
      const groupData = this.groupForm.value;
      this.groupService.createGroup(groupData).subscribe({
        next: (response) => {
          if (response.success) {
            // Add the new group to the local array
            if (response.data && response.data.GroupID) {
              this.groups.unshift(response.data);
              this.parentGroups.unshift(response.data);
              this.selectedRowId = response.data.GroupID;
              // Now confirm the record
              const groupId = this.selectedRowId as number;
              this.groupService.confirmGroup(groupId).subscribe({
                next: (confirmResponse) => {
                  this.loading = false;
                  if (confirmResponse.success) {
                    this.success = 'Group created and confirmed successfully!';
                    this.isFormFilled = true;
                    this.loadGroups();
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
                  // If confirm fails but record was created, show success anyway
                  this.success = 'Group created successfully! (Confirm column missing - please run SQL migration)';
                  this.isFormFilled = true;
                  this.loadGroups();
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
              this.error = 'Error: No GroupID returned from server';
              setTimeout(() => this.error = '', 3000);
            }
          } else {
            this.loading = false;
            this.error = response.message || 'Error creating group';
            setTimeout(() => this.error = '', 3000);
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Error creating group';
          setTimeout(() => this.error = '', 3000);
          console.error(err);
        }
      });
    } else if (this.showForm && this.isEditMode && this.selectedGroupId) {
      // Edit mode: save changes first, then confirm
      if (this.groupForm.invalid) {
        Object.keys(this.groupForm.controls).forEach(key => {
          this.groupForm.get(key)?.markAsTouched();
        });
        this.error = 'Please fill all required fields before confirming';
        setTimeout(() => this.error = '', 3000);
        return;
      }

      this.loading = true;
      const groupData = this.groupForm.value;
      this.groupService.updateGroup(this.selectedGroupId, groupData).subscribe({
        next: (response) => {
          if (response.success) {
            // Now confirm the updated record
            this.groupService.confirmGroup(this.selectedGroupId!).subscribe({
              next: (confirmResponse) => {
                this.loading = false;
                if (confirmResponse.success) {
                  this.success = 'Group updated and confirmed successfully!';
                  this.isFormFilled = true;
                  this.loadGroups();
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
                this.success = 'Group updated successfully! (Confirm column missing - please run SQL migration)';
                this.isFormFilled = true;
                this.loadGroups();
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
            this.error = response.message || 'Error updating group';
            setTimeout(() => this.error = '', 3000);
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Error updating group';
          setTimeout(() => this.error = '', 3000);
          console.error(err);
        }
      });
    } else if (this.selectedRowId && this.selectedRowId > 0 && !this.showForm) {
      // Confirm an existing saved record (not in edit mode)
      this.loading = true;
      this.groupService.confirmGroup(this.selectedRowId as number).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.success = `Record ${this.selectedRowId} confirmed successfully!`;
            this.isFormFilled = true;
            this.loadGroups();
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
    // Navigate back or close the current view
    this.error = 'Close functionality - returning to previous view';
    setTimeout(() => this.error = '', 3000);
  }
}