import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FinancialYearService, FinancialYear } from '../../services/financial-year.service';
import { FirmService } from '../../services/firm.service';

@Component({
  selector: 'app-financial-year',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './financial-year.component.html',
  styleUrls: ['./financial-year.component.scss']
})
export class FinancialYearComponent implements OnInit {
  financialYears: FinancialYear[] = [];
  filteredFinancialYears: FinancialYear[] = [];
  firms: any[] = [];
  searchTerm: string = '';
  financialYearForm: FormGroup;
  isEditMode: boolean = false;
  selectedFinancialYearId: number | null = null;
  selectedRowId: number | null = null;
  loading: boolean = false;
  error: string = '';
  success: string = '';
  showForm: boolean = false;
  isFormFilled: boolean = false;

  private fb = inject(FormBuilder);
  private financialYearService = inject(FinancialYearService);
  private firmService = inject(FirmService);
  private router = inject(Router);

  constructor() {
    this.financialYearForm = this.fb.group({
      FirmID: ['', Validators.required],
      YearCode: ['', [Validators.required, Validators.maxLength(20)]],
      YearName: ['', [Validators.required, Validators.maxLength(100)]],
      StartDate: ['', Validators.required],
      EndDate: ['', Validators.required],
      IsCurrent: [false],
      IsActive: [true],
      Remarks: ['', Validators.maxLength(500)]
    });
  }

  ngOnInit(): void {
    this.loadFinancialYears();
    this.loadFirms();
  }

  loadFinancialYears(): void {
    this.loading = true;
    this.financialYearService.getAll().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.financialYears = response.data;
          this.applyFilter();
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Error loading financial years';
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
      this.filteredFinancialYears = this.financialYears;
      return;
    }
    this.filteredFinancialYears = this.financialYears.filter(fy =>
      fy.YearCode?.toLowerCase().includes(term) ||
      fy.YearName?.toLowerCase().includes(term) ||
      fy.FirmName?.toLowerCase().includes(term)
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
    this.financialYearForm.reset({
      IsActive: true,
      IsCurrent: false
    });
    this.isEditMode = false;
    this.selectedFinancialYearId = null;
    this.error = '';
    this.success = '';
  }

  onSubmit(): void {
    if (this.financialYearForm.invalid) {
      Object.keys(this.financialYearForm.controls).forEach(key => {
        this.financialYearForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const formData = this.financialYearForm.value;

    if (this.isEditMode && this.selectedFinancialYearId) {
      this.financialYearService.update(this.selectedFinancialYearId, formData).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.success = 'Financial year updated successfully!';
            this.loadFinancialYears();
            setTimeout(() => {
              this.resetForm();
              this.showForm = false;
            }, 2000);
          }
          this.loading = false;
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Error updating financial year';
          this.loading = false;
          console.error(err);
        }
      });
    } else {
      this.financialYearService.create(formData).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.success = 'Financial year created successfully!';
            if (response.data && response.data.FinancialYearID) {
              this.financialYears.unshift(response.data);
              this.selectedRowId = response.data.FinancialYearID;
            }
            this.loadFinancialYears();
            setTimeout(() => {
              this.resetForm();
              this.showForm = false;
            }, 1500);
          }
          this.loading = false;
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Error creating financial year';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  editFinancialYear(financialYear: FinancialYear): void {
    this.isEditMode = true;
    this.selectedFinancialYearId = financialYear.FinancialYearID!;
    this.selectedRowId = financialYear.FinancialYearID!;
    this.showForm = true;
    this.isFormFilled = false;

    this.financialYearForm.patchValue({
      FirmID: financialYear.FirmID,
      YearCode: financialYear.YearCode,
      YearName: financialYear.YearName,
      StartDate: financialYear.StartDate,
      EndDate: financialYear.EndDate,
      IsCurrent: financialYear.IsCurrent || false,
      IsActive: financialYear.IsActive !== undefined ? financialYear.IsActive : true,
      Remarks: financialYear.Remarks || ''
    });
  }

  deleteFinancialYear(id: number): void {
    if (confirm('Are you sure you want to delete this financial year?')) {
      this.loading = true;
      this.financialYearService.delete(id).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.success = 'Financial year deleted successfully!';
            this.loadFinancialYears();
            setTimeout(() => this.success = '', 3000);
          }
          this.loading = false;
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Error deleting financial year';
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
      const financialYear = this.financialYears.find(fy => fy.FinancialYearID === this.selectedRowId);
      if (financialYear) {
        this.editFinancialYear(financialYear);
      }
    }
  }

  deleteSelected(): void {
    if (this.selectedRowId) {
      this.deleteFinancialYear(this.selectedRowId);
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
      this.success = `Financial year ${this.selectedRowId} confirmed successfully!`;
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
