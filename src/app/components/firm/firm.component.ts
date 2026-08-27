import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FirmService, Firm } from '../../services/firm.service';

@Component({
  selector: 'app-firm',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './firm.component.html',
  styleUrls: ['./firm.component.scss']
})
export class FirmComponent implements OnInit {
  firms: Firm[] = [];
  filteredFirms: Firm[] = [];
  searchTerm: string = '';
  firmForm: FormGroup;
  isEditMode: boolean = false;
  selectedFirmId: number | null = null;
  selectedRowId: number | null = null;
  loading: boolean = false;
  error: string = '';
  success: string = '';
  showForm: boolean = false;
  isFormFilled: boolean = false;
  
  states = ['KARNATAKA', 'MAHARASHTRA', 'TAMIL NADU', 'KERALA', 'ANDHRA PRADESH', 
            'TELANGANA', 'GUJARAT', 'RAJASTHAN', 'DELHI', 'UTTAR PRADESH', 'WEST BENGAL'];

  constructor(
    private fb: FormBuilder,
    private firmService: FirmService,
    private router: Router
  ) {
    this.firmForm = this.fb.group({
      Code: ['', [Validators.required, Validators.maxLength(50)]],
      TradeName: ['', [Validators.required, Validators.maxLength(100)]],
      LegalName: ['', [Validators.maxLength(100)]],
      Alias: ['', [Validators.maxLength(50)]],
      PanNo: ['', [Validators.maxLength(50)]],
      CINNo: ['', [Validators.maxLength(50)]],
      MSMEId: ['', [Validators.maxLength(50)]],
      Jurisdiction: ['', [Validators.maxLength(100)]],
      LandlineNo: ['', [Validators.maxLength(20)]],
      MobileNo: ['', [Validators.maxLength(20)]],
      EmailId: ['', [Validators.email, Validators.maxLength(100)]],
      WebAddress: ['', [Validators.maxLength(200)]],
      Address1: ['', [Validators.maxLength(500)]],
      Address2: ['', [Validators.maxLength(500)]],
      Place: ['', [Validators.maxLength(100)]],
      State: ['', [Validators.maxLength(50)]],
      Pincode: ['', [Validators.maxLength(10)]],
      IsActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadFirms();
  }

  loadFirms(): void {
    this.loading = true;
    this.firmService.getFirms().subscribe({
      next: (response) => {
        if (response.success) {
          this.firms = response.data;
          this.applyFilter();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading firms';
        this.loading = false;
        console.error(err);
      }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredFirms = this.firms;
      return;
    }
    this.filteredFirms = this.firms.filter(firm =>
      firm.Code?.toLowerCase().includes(term) ||
      firm.TradeName?.toLowerCase().includes(term)
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
    this.firmForm.reset({
      IsActive: true
    });
    this.isEditMode = false;
    this.selectedFirmId = null;
    this.error = '';
    this.success = '';
  }

  onSubmit(): void {
    if (this.firmForm.invalid) {
      Object.keys(this.firmForm.controls).forEach(key => {
        this.firmForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const firmData = this.firmForm.value;

    if (this.isEditMode && this.selectedFirmId) {
      this.firmService.updateFirm(this.selectedFirmId, firmData).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Firm updated successfully!';
            this.loadFirms();
            setTimeout(() => {
              this.resetForm();
              this.showForm = false;
            }, 2000);
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error updating firm';
          this.loading = false;
          console.error(err);
        }
      });
    } else {
      this.firmService.createFirm(firmData).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Firm created successfully!';
            // Add the new firm to the local array immediately
            if (response.data && response.data.FirmID) {
              this.firms.unshift(response.data);
              this.selectedRowId = response.data.FirmID;
            }
            // Refresh in background
            this.loadFirms();
            setTimeout(() => {
              this.resetForm();
              this.showForm = false;
            }, 1500);
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error creating firm';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  editFirm(firm: Firm): void {
    this.isEditMode = true;
    this.selectedFirmId = firm.FirmID!;
    this.selectedRowId = firm.FirmID!;
    this.showForm = true;
    this.isFormFilled = false;
    
    this.firmForm.patchValue({
      Code: firm.Code,
      TradeName: firm.TradeName,
      LegalName: firm.LegalName || '',
      Alias: firm.Alias || '',
      PanNo: firm.PanNo || '',
      CINNo: firm.CINNo || '',
      MSMEId: firm.MSMEId || '',
      Jurisdiction: firm.Jurisdiction || '',
      LandlineNo: firm.LandlineNo || '',
      MobileNo: firm.MobileNo || '',
      EmailId: firm.EmailId || '',
      WebAddress: firm.WebAddress || '',
      Address1: firm.Address1 || '',
      Address2: firm.Address2 || '',
      Place: firm.Place || '',
      State: firm.State || '',
      Pincode: firm.Pincode || '',
      IsActive: firm.IsActive !== undefined ? firm.IsActive : true
    });
  }

  deleteFirm(id: number): void {
    if (confirm('Are you sure you want to delete this firm?')) {
      this.loading = true;
      this.firmService.deleteFirm(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Firm deleted successfully!';
            this.loadFirms();
            setTimeout(() => this.success = '', 3000);
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error deleting firm';
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
      const firm = this.firms.find(f => f.FirmID === this.selectedRowId);
      if (firm) {
        this.editFirm(firm);
      }
    }
  }

  deleteSelected(): void {
    if (this.selectedRowId) {
      this.deleteFirm(this.selectedRowId);
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
      if (this.firmForm.invalid) {
        Object.keys(this.firmForm.controls).forEach(key => {
          this.firmForm.get(key)?.markAsTouched();
        });
        this.error = 'Please fill all required fields before confirming';
        setTimeout(() => this.error = '', 3000);
        return;
      }

      this.loading = true;
      const firmData = this.firmForm.value;
      this.firmService.createFirm(firmData).subscribe({
        next: (response) => {
          if (response.success) {
            // Add the new firm to the local array
            if (response.data && response.data.FirmID) {
              this.firms.unshift(response.data);
              this.selectedRowId = response.data.FirmID;
              // Now confirm the record
              const firmId = this.selectedRowId as number;
              this.firmService.confirmFirm(firmId).subscribe({
                next: (confirmResponse) => {
                  this.loading = false;
                  if (confirmResponse.success) {
                    this.success = 'Firm created and confirmed successfully!';
                    this.isFormFilled = true;
                    this.loadFirms();
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
                  this.success = 'Firm created successfully! (Confirm column missing - please run SQL migration)';
                  this.isFormFilled = true;
                  this.loadFirms();
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
              this.error = 'Error: No FirmID returned from server';
              setTimeout(() => this.error = '', 3000);
            }
          } else {
            this.loading = false;
            this.error = response.message || 'Error creating firm';
            setTimeout(() => this.error = '', 3000);
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Error creating firm';
          setTimeout(() => this.error = '', 3000);
          console.error(err);
        }
      });
    } else if (this.showForm && this.isEditMode && this.selectedFirmId) {
      // Edit mode: save changes first, then confirm
      if (this.firmForm.invalid) {
        Object.keys(this.firmForm.controls).forEach(key => {
          this.firmForm.get(key)?.markAsTouched();
        });
        this.error = 'Please fill all required fields before confirming';
        setTimeout(() => this.error = '', 3000);
        return;
      }

      this.loading = true;
      const firmData = this.firmForm.value;
      this.firmService.updateFirm(this.selectedFirmId, firmData).subscribe({
        next: (response) => {
          if (response.success) {
            // Now confirm the updated record
            this.firmService.confirmFirm(this.selectedFirmId!).subscribe({
              next: (confirmResponse) => {
                this.loading = false;
                if (confirmResponse.success) {
                  this.success = 'Firm updated and confirmed successfully!';
                  this.isFormFilled = true;
                  this.loadFirms();
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
                this.success = 'Firm updated successfully! (Confirm column missing - please run SQL migration)';
                this.isFormFilled = true;
                this.loadFirms();
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
            this.error = response.message || 'Error updating firm';
            setTimeout(() => this.error = '', 3000);
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Error updating firm';
          setTimeout(() => this.error = '', 3000);
          console.error(err);
        }
      });
    } else if (this.selectedRowId && this.selectedRowId > 0 && !this.showForm) {
      // Confirm an existing saved record (not in edit mode)
      this.loading = true;
      this.firmService.confirmFirm(this.selectedRowId).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.success = `Record ${this.selectedRowId} confirmed successfully!`;
            this.isFormFilled = true;
            this.loadFirms();
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