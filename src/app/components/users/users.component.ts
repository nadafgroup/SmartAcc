import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  userForm: FormGroup;
  isEditMode: boolean = false;
  selectedUserId: number | null = null;
  selectedRowId: number | null = null;
  loading: boolean = false;
  error: string = '';
  success: string = '';
  showForm: boolean = false;
  isFormFilled: boolean = false;
  
  roles = ['Admin', 'Manager', 'User', 'Guest'];
  states = ['KARNATAKA', 'MAHARASHTRA', 'TAMIL NADU', 'KERALA', 'ANDHRA PRADESH', 
            'TELANGANA', 'GUJARAT', 'RAJASTHAN', 'DELHI', 'UTTAR PRADESH', 'WEST BENGAL'];
  departments = ['IT', 'HR', 'Finance', 'Sales', 'Marketing', 'Operations', 'Admin'];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      UserCode: ['', [Validators.required, Validators.maxLength(50)]],
      Username: ['', [Validators.required, Validators.maxLength(50)]],
      Password: ['', [Validators.minLength(6), Validators.maxLength(255)]],
      FullName: ['', [Validators.required, Validators.maxLength(100)]],
      Email: ['', [Validators.email, Validators.maxLength(100)]],
      Phone: ['', [Validators.maxLength(20)]],
      Mobile: ['', [Validators.maxLength(20)]],
      Role: ['User', Validators.required],
      Department: [''],
      Designation: [''],
      Address: [''],
      City: [''],
      State: [''],
      Pincode: ['', [Validators.maxLength(10)]],
      IsActive: [true],
      IsLocked: [false],
      Remarks: ['']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (response) => {
        if (response.success) {
          this.users = response.data;
          this.applyFilter();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading users';
        this.loading = false;
        console.error(err);
      }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredUsers = this.users;
      return;
    }
    this.filteredUsers = this.users.filter(user =>
      user.UserCode?.toLowerCase().includes(term) ||
      user.Username?.toLowerCase().includes(term) ||
      user.FullName?.toLowerCase().includes(term) ||
      user.Email?.toLowerCase().includes(term)
    );
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    } else {
      this.selectedRowId = -1;
      this.isFormFilled = false;
    }
  }

  resetForm(): void {
    this.userForm.reset({
      Role: 'User',
      IsActive: true,
      IsLocked: false
    });
    this.isEditMode = false;
    this.selectedUserId = null;
    this.error = '';
    this.success = '';
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const userData = this.userForm.value;

    if (this.isEditMode && this.selectedUserId) {
      this.userService.updateUser(this.selectedUserId, userData).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'User updated successfully!';
            this.loadUsers();
            setTimeout(() => {
              this.resetForm();
              this.showForm = false;
            }, 2000);
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error updating user';
          this.loading = false;
          console.error(err);
        }
      });
    } else {
      this.userService.createUser(userData).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'User created successfully!';
            this.loadUsers();
            setTimeout(() => {
              this.resetForm();
              this.showForm = false;
            }, 1500);
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error creating user';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  editUser(user: User): void {
    this.isEditMode = true;
    this.selectedUserId = user.UserID!;
    this.selectedRowId = user.UserID!;
    this.showForm = true;
    this.isFormFilled = false;
    
    this.userForm.patchValue({
      UserCode: user.UserCode,
      Username: user.Username,
      FullName: user.FullName,
      Email: user.Email || '',
      Phone: user.Phone || '',
      Mobile: user.Mobile || '',
      Role: user.Role || 'User',
      Department: user.Department || '',
      Designation: user.Designation || '',
      Address: user.Address || '',
      City: user.City || '',
      State: user.State || '',
      Pincode: user.Pincode || '',
      IsActive: user.IsActive !== undefined ? user.IsActive : true,
      IsLocked: user.IsLocked !== undefined ? user.IsLocked : false,
      Remarks: user.Remarks || ''
    });
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.loading = true;
      this.userService.deleteUser(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'User deleted successfully!';
            this.loadUsers();
            setTimeout(() => this.success = '', 3000);
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error deleting user';
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

  selectRow(id: number): void {
    this.selectedRowId = this.selectedRowId === id ? null : id;
  }

  onEdit(): void {
    if (this.selectedRowId) {
      const user = this.users.find(u => u.UserID === this.selectedRowId);
      if (user) {
        this.editUser(user);
      }
    }
  }

  deleteSelected(): void {
    if (this.selectedRowId) {
      this.deleteUser(this.selectedRowId);
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
      if (this.userForm.invalid) {
        Object.keys(this.userForm.controls).forEach(key => {
          this.userForm.get(key)?.markAsTouched();
        });
        this.error = 'Please fill all required fields before confirming';
        setTimeout(() => this.error = '', 3000);
        return;
      }

      this.loading = true;
      const userData = this.userForm.value;
      this.userService.createUser(userData).subscribe({
        next: (response) => {
          if (response.success) {
            const newUserId = response.data && response.data.UserID ? response.data.UserID : response.data;
            if (newUserId) {
              this.selectedRowId = newUserId;
              this.userService.confirmUser(newUserId).subscribe({
                next: (confirmResponse) => {
                  this.loading = false;
                  if (confirmResponse.success) {
                    this.success = 'User created and confirmed successfully!';
                    this.isFormFilled = true;
                    this.loadUsers();
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
                  this.success = 'User created successfully!';
                  this.isFormFilled = true;
                  this.loadUsers();
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
              this.error = 'Error: No UserID returned from server';
              setTimeout(() => this.error = '', 3000);
            }
          } else {
            this.loading = false;
            this.error = response.message || 'Error creating user';
            setTimeout(() => this.error = '', 3000);
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Error creating user';
          setTimeout(() => this.error = '', 3000);
          console.error(err);
        }
      });
    } else if (this.showForm && this.isEditMode && this.selectedUserId) {
      // Edit mode: save changes first, then confirm
      if (this.userForm.invalid) {
        Object.keys(this.userForm.controls).forEach(key => {
          this.userForm.get(key)?.markAsTouched();
        });
        this.error = 'Please fill all required fields before confirming';
        setTimeout(() => this.error = '', 3000);
        return;
      }

      this.loading = true;
      const userData = this.userForm.value;
      this.userService.updateUser(this.selectedUserId, userData).subscribe({
        next: (response) => {
          if (response.success) {
            this.userService.confirmUser(this.selectedUserId!).subscribe({
              next: (confirmResponse) => {
                this.loading = false;
                if (confirmResponse.success) {
                  this.success = 'User updated and confirmed successfully!';
                  this.isFormFilled = true;
                  this.loadUsers();
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
                this.success = 'User updated successfully!';
                this.isFormFilled = true;
                this.loadUsers();
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
            this.error = response.message || 'Error updating user';
            setTimeout(() => this.error = '', 3000);
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Error updating user';
          setTimeout(() => this.error = '', 3000);
          console.error(err);
        }
      });
    } else if (this.selectedRowId && this.selectedRowId > 0 && !this.showForm) {
      // Confirm an existing saved record (not in edit mode)
      this.loading = true;
      const userId = this.selectedRowId as number;
      this.userService.confirmUser(userId).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.success = `Record ${userId} confirmed successfully!`;
            this.isFormFilled = true;
            this.loadUsers();
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
    this.resetForm();
    this.showForm = false;
    this.selectedRowId = null;
    this.isFormFilled = false;
    this.router.navigate(['/dashboard']);
  }
}