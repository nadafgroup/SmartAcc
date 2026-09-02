import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DistrictService, District } from '../../services/district.service';
import { StateService, State } from '../../services/state.service';

@Component({
  selector: 'app-district',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './district.component.html',
  styleUrls: ['./district.component.scss']
})
export class DistrictComponent implements OnInit {
  districts: District[] = [];
  filteredDistricts: District[] = [];
  states: State[] = [];
  searchTerm: string = '';
  districtForm: FormGroup;
  isEditMode: boolean = false;
  selectedDistrictId: number | null = null;
  selectedRowId: number | null = null;
  loading: boolean = false;
  error: string = '';
  success: string = '';
  showForm: boolean = false;
  isFormFilled: boolean = false;

  constructor(
    private fb: FormBuilder,
    private districtService: DistrictService,
    private stateService: StateService,
    private router: Router
  ) {
    this.districtForm = this.fb.group({
      DistrictCode: ['', [Validators.required, Validators.maxLength(50)]],
      DistrictName: ['', [Validators.required, Validators.maxLength(100)]],
      StateID: [null, Validators.required],
      OpeningBalance: [0],
      IsActive: [true],
      Remarks: ['']
    });
  }

  ngOnInit(): void {
    this.loadDistricts();
    this.loadStates();
  }

  loadStates(): void {
    this.stateService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.states = response.data || [];
        }
      },
      error: (err) => {
        console.error('Error loading states:', err);
      }
    });
  }

  loadDistricts(): void {
    this.loading = true;
    this.error = '';
    this.districtService.getAll().subscribe({
      next: (response) => {
        console.log('Districts response:', response);
        if (response.success) {
          this.districts = response.data || [];
          this.applyFilter();
        } else {
          this.error = response.message || 'Error loading districts';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading districts:', err);
        this.error = err.error?.message || err.message || 'Error loading districts';
        this.loading = false;
      }
    });
  }

  getStateName(stateId: number | undefined): string {
    if (!stateId) return '';
    const state = this.states.find(s => s.StateID === stateId);
    return state ? state.StateName : '';
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredDistricts = this.districts;
      return;
    }
    this.filteredDistricts = this.districts.filter(district => {
      const stateName = this.getStateName(district.StateID);
      return district.DistrictCode?.toLowerCase().includes(term) ||
        district.DistrictName?.toLowerCase().includes(term) ||
        stateName?.toLowerCase().includes(term);
    });
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
    this.districtForm.reset({
      OpeningBalance: 0,
      IsActive: true
    });
    this.isEditMode = false;
    this.selectedDistrictId = null;
    this.error = '';
    this.success = '';
  }

  onSubmit(): void {
    if (this.districtForm.invalid) {
      Object.keys(this.districtForm.controls).forEach(key => {
        this.districtForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const districtData = this.districtForm.value;

    if (this.isEditMode && this.selectedDistrictId) {
      this.districtService.update(this.selectedDistrictId, districtData).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'District updated successfully!';
            this.loadDistricts();
            setTimeout(() => {
              this.resetForm();
              this.showForm = false;
            }, 2000);
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error updating district';
          this.loading = false;
          console.error(err);
        }
      });
    } else {
      this.districtService.create(districtData).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'District created successfully!';
            if (response.data && response.data.DistrictID) {
              this.districts.unshift(response.data);
              this.selectedRowId = response.data.DistrictID;
            }
            this.loadDistricts();
            setTimeout(() => {
              this.resetForm();
              this.showForm = false;
            }, 1500);
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error creating district';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  editDistrict(district: District): void {
    this.isEditMode = true;
    this.selectedDistrictId = district.DistrictID!;
    this.selectedRowId = district.DistrictID!;
    this.showForm = true;
    this.isFormFilled = false;

    // Ensure StateID is properly set from the district data
    const stateId = district.StateID || null;
    
    this.districtForm.patchValue({
      DistrictCode: district.DistrictCode,
      DistrictName: district.DistrictName,
      StateID: stateId,
      OpeningBalance: district.OpeningBalance || 0,
      IsActive: district.IsActive !== undefined ? district.IsActive : true,
      Remarks: district.Remarks || ''
    });
    
    // Force the StateID to be set correctly
    this.districtForm.get('StateID')?.setValue(stateId);
  }

  deleteDistrict(id: number): void {
    if (confirm('Are you sure you want to delete this district?')) {
      this.loading = true;
      this.districtService.delete(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'District deleted successfully!';
            this.loadDistricts();
            setTimeout(() => this.success = '', 3000);
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error deleting district';
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
      const district = this.districts.find(d => d.DistrictID === this.selectedRowId);
      if (district) {
        this.editDistrict(district);
      }
    }
  }

  deleteSelected(): void {
    if (this.selectedRowId) {
      this.deleteDistrict(this.selectedRowId);
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
    if (this.showForm && this.selectedRowId === -1) {
      if (this.districtForm.invalid) {
        Object.keys(this.districtForm.controls).forEach(key => {
          this.districtForm.get(key)?.markAsTouched();
        });
        this.error = 'Please fill all required fields before confirming';
        setTimeout(() => this.error = '', 3000);
        return;
      }

      this.loading = true;
      const districtData = this.districtForm.value;
      this.districtService.create(districtData).subscribe({
        next: (response) => {
          if (response.success && response.data && response.data.DistrictID) {
            const id = response.data.DistrictID;
            this.districtService.confirm(id).subscribe({
              next: (confirmResponse) => {
                this.loading = false;
                if (confirmResponse.success) {
                  this.success = 'District created and confirmed successfully!';
                  this.isFormFilled = true;
                  this.loadDistricts();
                  setTimeout(() => {
                    this.success = '';
                    this.resetForm();
                    this.showForm = false;
                    this.selectedRowId = null;
                    this.isFormFilled = false;
                  }, 2000);
                }
              },
              error: (err) => {
                this.loading = false;
                this.success = 'District created successfully!';
                this.isFormFilled = true;
                this.loadDistricts();
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
            this.error = response.message || 'Error creating district';
            setTimeout(() => this.error = '', 3000);
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Error creating district';
          setTimeout(() => this.error = '', 3000);
          console.error(err);
        }
      });
    } else if (this.showForm && this.isEditMode && this.selectedDistrictId) {
      if (this.districtForm.invalid) {
        Object.keys(this.districtForm.controls).forEach(key => {
          this.districtForm.get(key)?.markAsTouched();
        });
        this.error = 'Please fill all required fields before confirming';
        setTimeout(() => this.error = '', 3000);
        return;
      }

      this.loading = true;
      const districtData = this.districtForm.value;
      this.districtService.update(this.selectedDistrictId, districtData).subscribe({
        next: (response) => {
          if (response.success) {
            this.districtService.confirm(this.selectedDistrictId!).subscribe({
              next: (confirmResponse) => {
                this.loading = false;
                if (confirmResponse.success) {
                  this.success = 'District updated and confirmed successfully!';
                  this.isFormFilled = true;
                  this.loadDistricts();
                  setTimeout(() => {
                    this.success = '';
                    this.resetForm();
                    this.showForm = false;
                    this.selectedRowId = null;
                    this.isFormFilled = false;
                  }, 2000);
                }
              },
              error: (err) => {
                this.loading = false;
                this.success = 'District updated successfully!';
                this.isFormFilled = true;
                this.loadDistricts();
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
            this.error = response.message || 'Error updating district';
            setTimeout(() => this.error = '', 3000);
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Error updating district';
          setTimeout(() => this.error = '', 3000);
          console.error(err);
        }
      });
    } else if (this.selectedRowId && this.selectedRowId > 0 && !this.showForm) {
      this.loading = true;
      this.districtService.confirm(this.selectedRowId).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.success = `Record ${this.selectedRowId} confirmed successfully!`;
            this.isFormFilled = true;
            this.loadDistricts();
            setTimeout(() => {
              this.success = '';
              this.resetForm();
              this.showForm = false;
              this.selectedRowId = null;
              this.isFormFilled = false;
            }, 2000);
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
