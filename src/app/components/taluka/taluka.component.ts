import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TalukaService, Taluka } from '../../services/taluka.service';
import { DistrictService, District } from '../../services/district.service';
import { StateService, State } from '../../services/state.service';

@Component({
  selector: 'app-taluka',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './taluka.component.html',
  styleUrls: ['./taluka.component.scss']
})
export class TalukaComponent implements OnInit {
  talukas: Taluka[] = [];
  filteredTalukas: Taluka[] = [];
  states: State[] = [];
  districts: District[] = [];
  filteredDistricts: District[] = [];
  searchTerm: string = '';
  talukaForm: FormGroup;
  isEditMode: boolean = false;
  selectedTalukaId: number | null = null;
  selectedRowId: number | null = null;
  loading: boolean = false;
  error: string = '';
  success: string = '';
  showForm: boolean = false;
  isFormFilled: boolean = false;

  constructor(
    private fb: FormBuilder,
    private talukaService: TalukaService,
    private districtService: DistrictService,
    private stateService: StateService,
    private router: Router
  ) {
    this.talukaForm = this.fb.group({
      TalukaCode: ['', [Validators.required, Validators.maxLength(50)]],
      TalukaName: ['', [Validators.required, Validators.maxLength(100)]],
      StateID: [null],
      DistrictID: [null],
      OpeningBalance: [0],
      IsActive: [true],
      Remarks: ['']
    });
  }

  ngOnInit(): void {
    this.loadTalukas();
    this.loadStates();
    this.loadDistricts();
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

  loadTalukas(): void {
    this.loading = true;
    this.error = '';
    this.talukaService.getAll().subscribe({
      next: (response) => {
        console.log('Talukas response:', response);
        // Handle both formats: { success: true, data: [...] } or direct array
        if (response && response.success !== undefined) {
          if (response.success) {
            this.talukas = Array.isArray(response.data) ? response.data : [];
            this.applyFilter();
          } else {
            this.error = response.message || 'Error loading talukas';
          }
        } else if (Array.isArray(response)) {
          // Direct array response
          this.talukas = response;
          this.applyFilter();
        } else {
          this.error = 'Unexpected response format';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading talukas:', err);
        this.error = err.error?.message || err.message || 'Error loading talukas';
        this.loading = false;
      }
    });
  }

  loadDistricts(): void {
    this.districtService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.districts = response.data || [];
          this.filterDistrictsByState();
        }
      },
      error: (err) => {
        console.error('Error loading districts:', err);
      }
    });
  }

  filterDistrictsByState(): void {
    const stateId = this.talukaForm.get('StateID')?.value;
    if (stateId) {
      this.filteredDistricts = this.districts.filter(d => d.StateID === stateId);
    } else {
      this.filteredDistricts = this.districts;
    }
    // Reset DistrictID if current selection is not in filtered list
    const currentDistrictId = this.talukaForm.get('DistrictID')?.value;
    if (currentDistrictId && !this.filteredDistricts.some(d => d.DistrictID === currentDistrictId)) {
      this.talukaForm.patchValue({ DistrictID: null });
    }
  }

  onStateChange(): void {
    this.filterDistrictsByState();
  }

  getDistrictName(districtId: number | null | undefined): string {
    if (!districtId) return '';
    const district = this.districts.find(d => d.DistrictID === districtId);
    return district ? district.DistrictName : '';
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredTalukas = this.talukas;
      return;
    }
    this.filteredTalukas = this.talukas.filter(taluka =>
      taluka.TalukaCode?.toLowerCase().includes(term) ||
      taluka.TalukaName?.toLowerCase().includes(term) ||
      taluka.DistrictName?.toLowerCase().includes(term)
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
    this.talukaForm.reset({
      OpeningBalance: 0,
      IsActive: true,
      DistrictID: null
    });
    this.isEditMode = false;
    this.selectedTalukaId = null;
    this.error = '';
    this.success = '';
  }

  onSubmit(): void {
    if (this.talukaForm.invalid) {
      Object.keys(this.talukaForm.controls).forEach(key => {
        this.talukaForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const talukaData = this.talukaForm.value;

    if (this.isEditMode && this.selectedTalukaId) {
      this.talukaService.update(this.selectedTalukaId, talukaData).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Taluka updated successfully!';
            this.loadTalukas();
            setTimeout(() => {
              this.resetForm();
              this.showForm = false;
            }, 2000);
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error updating taluka';
          this.loading = false;
          console.error(err);
        }
      });
    } else {
      this.talukaService.create(talukaData).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Taluka created successfully!';
            if (response.data && response.data.TalukaID) {
              this.talukas.unshift(response.data);
              this.selectedRowId = response.data.TalukaID;
            }
            this.loadTalukas();
            setTimeout(() => {
              this.resetForm();
              this.showForm = false;
            }, 1500);
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error creating taluka';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  editTaluka(taluka: Taluka): void {
    this.isEditMode = true;
    this.selectedTalukaId = taluka.TalukaID!;
    this.selectedRowId = taluka.TalukaID!;
    this.showForm = true;
    this.isFormFilled = false;

    this.talukaForm.patchValue({
      TalukaCode: taluka.TalukaCode,
      TalukaName: taluka.TalukaName,
      DistrictID: taluka.DistrictID || null,
      OpeningBalance: taluka.OpeningBalance || 0,
      IsActive: taluka.IsActive !== undefined ? taluka.IsActive : true,
      Remarks: taluka.Remarks || ''
    });
  }

  deleteTaluka(taluka: Taluka): void {
    const id = taluka.TalukaID;
    if (!id) {
      this.error = 'Invalid taluka ID';
      return;
    }
    if (confirm('Are you sure you want to delete this taluka?')) {
      this.loading = true;
      this.talukaService.delete(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Taluka deleted successfully!';
            this.loadTalukas();
            setTimeout(() => this.success = '', 3000);
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error deleting taluka';
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

  closeForm(): void {
    this.resetForm();
    this.showForm = false;
  }

  selectRow(id: number | undefined): void {
    if (id === undefined) {
      this.selectedRowId = null;
      return;
    }
    this.selectedRowId = this.selectedRowId === id ? null : id;
  }

  editSelected(): void {
    if (this.selectedRowId) {
      const taluka = this.talukas.find(t => t.TalukaID === this.selectedRowId);
      if (taluka) {
        this.editTaluka(taluka);
      }
    }
  }

  deleteSelected(): void {
    if (this.selectedRowId) {
      const taluka = this.talukas.find(t => t.TalukaID === this.selectedRowId);
      if (taluka) {
        this.deleteTaluka(taluka);
      }
    }
  }

  confirmSelected(): void {
    if (this.selectedRowId) {
      this.loading = true;
      this.talukaService.confirm(this.selectedRowId).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Taluka confirmed successfully!';
            this.loadTalukas();
            setTimeout(() => this.success = '', 3000);
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error confirming taluka';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  undoSelected(): void {
    if (this.selectedRowId) {
      this.loading = true;
      // Call confirm endpoint to toggle confirmation status
      this.talukaService.confirm(this.selectedRowId).subscribe({
        next: (response) => {
          if (response.success) {
            this.success = 'Taluka undone successfully!';
            this.loadTalukas();
            setTimeout(() => this.success = '', 3000);
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error undoing taluka';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  filterTalukas(): void {
    this.applyFilter();
  }

  onEdit(): void {
    if (this.selectedRowId) {
      const taluka = this.talukas.find(t => t.TalukaID === this.selectedRowId);
      if (taluka) {
        this.editTaluka(taluka);
      }
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
      if (this.talukaForm.invalid) {
        Object.keys(this.talukaForm.controls).forEach(key => {
          this.talukaForm.get(key)?.markAsTouched();
        });
        this.error = 'Please fill all required fields before confirming';
        setTimeout(() => this.error = '', 3000);
        return;
      }

      this.loading = true;
      const talukaData = this.talukaForm.value;
      this.talukaService.create(talukaData).subscribe({
        next: (response) => {
          if (response.success && response.data && response.data.TalukaID) {
            const id = response.data.TalukaID;
            this.talukaService.confirm(id).subscribe({
              next: (confirmResponse) => {
                this.loading = false;
                if (confirmResponse.success) {
                  this.success = 'Taluka created and confirmed successfully!';
                  this.isFormFilled = true;
                  this.loadTalukas();
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
                this.success = 'Taluka created successfully!';
                this.isFormFilled = true;
                this.loadTalukas();
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
            this.error = response.message || 'Error creating taluka';
            setTimeout(() => this.error = '', 3000);
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Error creating taluka';
          setTimeout(() => this.error = '', 3000);
          console.error(err);
        }
      });
    } else if (this.showForm && this.isEditMode && this.selectedTalukaId) {
      if (this.talukaForm.invalid) {
        Object.keys(this.talukaForm.controls).forEach(key => {
          this.talukaForm.get(key)?.markAsTouched();
        });
        this.error = 'Please fill all required fields before confirming';
        setTimeout(() => this.error = '', 3000);
        return;
      }

      this.loading = true;
      const talukaData = this.talukaForm.value;
      this.talukaService.update(this.selectedTalukaId, talukaData).subscribe({
        next: (response) => {
          if (response.success) {
            this.talukaService.confirm(this.selectedTalukaId!).subscribe({
              next: (confirmResponse) => {
                this.loading = false;
                if (confirmResponse.success) {
                  this.success = 'Taluka updated and confirmed successfully!';
                  this.isFormFilled = true;
                  this.loadTalukas();
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
                this.success = 'Taluka updated successfully!';
                this.isFormFilled = true;
                this.loadTalukas();
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
            this.error = response.message || 'Error updating taluka';
            setTimeout(() => this.error = '', 3000);
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Error updating taluka';
          setTimeout(() => this.error = '', 3000);
          console.error(err);
        }
      });
    } else if (this.selectedRowId && this.selectedRowId > 0 && !this.showForm) {
      this.loading = true;
      this.talukaService.confirm(this.selectedRowId).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.success = `Record ${this.selectedRowId} confirmed successfully!`;
            this.isFormFilled = true;
            this.loadTalukas();
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
