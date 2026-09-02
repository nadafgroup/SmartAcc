import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BranchService, Branch } from '../../services/branch.service';
import { FirmService } from '../../services/firm.service';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './branches.component.html',
  styleUrls: ['./branches.component.scss']
})
export class BranchesComponent implements OnInit {
  branches: Branch[] = [];
  filteredBranches: Branch[] = [];
  firms: any[] = [];
  searchTerm: string = '';
  branchForm: FormGroup;
  isEditMode: boolean = false;
  selectedBranchId: number | null = null;
  selectedRowId: number | null = null;
  loading: boolean = false;
  error: string = '';
  success: string = '';
  showForm: boolean = false;
  isFormFilled: boolean = false;

  private fb = inject(FormBuilder);
  private branchService = inject(BranchService);
  private firmService = inject(FirmService);
  private router = inject(Router);

  constructor() {
    this.branchForm = this.fb.group({
      FirmID: ['', Validators.required],
      Code: ['', [Validators.required, Validators.maxLength(50)]],
      Name: ['', [Validators.required, Validators.maxLength(200)]],
      Address1: [''],
      Address2: [''],
      Place: [''],
      State: [''],
      Pincode: [''],
      Phone: [''],
      Mobile: [''],
      Email: ['', Validators.email],
      ContactPerson: [''],
      IsActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadBranches();
    this.loadFirms();
  }

  loadBranches(): void {
    this.loading = true;
    this.branchService.getAll().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.branches = response.data;
          this.applyFilter();
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Error loading branches';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadFirms(): void {
    this.firmService.getAll().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.firms = response.data;
        }
      },
      error: (err: any) => {
        console.error('Error loading firms:', err);
      }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredBranches = this.branches;
      return;
    }
    this.filteredBranches = this.branches.filter(branch =>
      branch.Code?.toLowerCase().includes(term) ||
      branch.Name?.toLowerCase().includes(term) ||
      branch.FirmName?.toLowerCase().includes(term) ||
      branch.Place?.toLowerCase().includes(term)
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
    this.branchForm.reset({
      IsActive: true
    });
    this.isEditMode = false;
    this.selectedBranchId = null;
    this.error = '';
    this.success = '';
  }

  onSubmit(): void {
    if (this.branchForm.invalid) {
      Object.keys(this.branchForm.controls).forEach(key => {
        this.branchForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const branchData = this.branchForm.value;

    if (this.isEditMode && this.selectedBranchId) {
      this.branchService.update(this.selectedBranchId, branchData).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.success = 'Branch updated successfully!';
            this.loadBranches();
            setTimeout(() => {
              this.resetForm();
              this.showForm = false;
            }, 2000);
          }
          this.loading = false;
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Error updating branch';
          this.loading = false;
          console.error(err);
        }
      });
    } else {
      this.branchService.create(branchData).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.success = 'Branch created successfully!';
            if (response.data && response.data.BranchID) {
              this.branches.unshift(response.data);
              this.selectedRowId = response.data.BranchID;
            }
            this.loadBranches();
            setTimeout(() => {
              this.resetForm();
              this.showForm = false;
            }, 1500);
          }
          this.loading = false;
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Error creating branch';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  editBranch(branch: Branch): void {
    this.isEditMode = true;
    this.selectedBranchId = branch.BranchID!;
    this.selectedRowId = branch.BranchID!;
    this.showForm = true;
    this.isFormFilled = false;

    this.branchForm.patchValue({
      FirmID: branch.FirmID,
      Code: branch.Code,
      Name: branch.Name,
      Address1: branch.Address1 || '',
      Address2: branch.Address2 || '',
      Place: branch.Place || '',
      State: branch.State || '',
      Pincode: branch.Pincode || '',
      Phone: branch.Phone || '',
      Mobile: branch.Mobile || '',
      Email: branch.Email || '',
      ContactPerson: branch.ContactPerson || '',
      IsActive: branch.IsActive !== undefined ? branch.IsActive : true
    });
  }

  deleteBranch(id: number): void {
    if (confirm('Are you sure you want to delete this branch?')) {
      this.loading = true;
      this.branchService.delete(id).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.success = 'Branch deleted successfully!';
            this.loadBranches();
            setTimeout(() => this.success = '', 3000);
          }
          this.loading = false;
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Error deleting branch';
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
      const branch = this.branches.find(b => b.BranchID === this.selectedRowId);
      if (branch) {
        this.editBranch(branch);
      }
    }
  }

  deleteSelected(): void {
    if (this.selectedRowId) {
      this.deleteBranch(this.selectedRowId);
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
    if (this.selectedRowId && this.selectedRowId > 0 && !this.showForm) {
      this.success = `Branch ${this.selectedRowId} confirmed successfully!`;
      this.isFormFilled = true;
      setTimeout(() => {
        this.success = '';
        this.selectedRowId = null;
        this.isFormFilled = false;
      }, 2000);
    } else {
      this.error = 'Please select a valid record to confirm';
      setTimeout(() => this.error = '', 3000);
    }
  }

  onUndo(): void {
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
