import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlaceService, Place } from '../../services/place.service';
import { TalukaService, Taluka } from '../../services/taluka.service';
import { DistrictService, District } from '../../services/district.service';
import { StateService, State } from '../../services/state.service';

@Component({
  selector: 'app-place',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './place.component.html',
  styleUrls: ['./place.component.scss']
})
export class PlaceComponent implements OnInit {
  places: Place[] = [];
  filteredPlaces: Place[] = [];
  states: State[] = [];
  districts: District[] = [];
  filteredDistricts: District[] = [];
  talukas: Taluka[] = [];
  filteredTalukas: Taluka[] = [];
  searchTerm: string = '';
  placeForm: FormGroup;
  isEditMode: boolean = false;
  selectedPlaceId: number | null = null;
  selectedRowId: number | null = null;
  loading: boolean = false;
  error: string = '';
  success: string = '';
  showForm: boolean = false;
  isFormFilled: boolean = false;

  constructor(
    private fb: FormBuilder,
    private placeService: PlaceService,
    private talukaService: TalukaService,
    private districtService: DistrictService,
    private stateService: StateService,
    private router: Router
  ) {
    this.placeForm = this.fb.group({
      PlaceCode: ['', [Validators.required, Validators.maxLength(50)]],
      PlaceName: ['', [Validators.required, Validators.maxLength(100)]],
      StateID: [null],
      DistrictID: [null],
      TalukaID: [null],
      Pincode: ['', Validators.maxLength(10)],
      OpeningBalance: [0],
      IsActive: [true],
      Remarks: ['']
    });
  }

  ngOnInit(): void {
    this.loadPlaces();
    this.loadStates();
    this.loadDistricts();
    this.loadTalukas();
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

  loadPlaces(): void {
    this.loading = true;
    this.error = '';
    this.placeService.getAll().subscribe({
      next: (response) => {
        console.log('Places response:', response);
        if (response.success) {
          this.places = response.data || [];
          this.filteredPlaces = this.places;
        } else {
          this.error = response.message || 'Error loading places';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading places:', err);
        this.error = err.error?.message || err.message || 'Error loading places';
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

  loadTalukas(): void {
    this.talukaService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.talukas = response.data || [];
          this.filterTalukasByDistrict();
        }
      },
      error: (err) => {
        console.error('Error loading talukas:', err);
      }
    });
  }

  filterDistrictsByState(): void {
    const stateId = this.placeForm.get('StateID')?.value;
    if (stateId) {
      this.filteredDistricts = this.districts.filter(d => d.StateID === stateId);
    } else {
      this.filteredDistricts = this.districts;
    }
    // Reset DistrictID if current selection is not in filtered list
    const currentDistrictId = this.placeForm.get('DistrictID')?.value;
    if (currentDistrictId && !this.filteredDistricts.some(d => d.DistrictID === currentDistrictId)) {
      this.placeForm.patchValue({ DistrictID: null });
    }
    // Reset TalukaID when district changes
    this.placeForm.patchValue({ TalukaID: null });
    this.filterTalukasByDistrict();
  }

  filterTalukasByDistrict(): void {
    const districtId = this.placeForm.get('DistrictID')?.value;
    if (districtId) {
      this.filteredTalukas = this.talukas.filter(t => t.DistrictID === districtId);
    } else {
      this.filteredTalukas = this.talukas;
    }
    // Reset TalukaID if current selection is not in filtered list
    const currentTalukaId = this.placeForm.get('TalukaID')?.value;
    if (currentTalukaId && !this.filteredTalukas.some(t => t.TalukaID === currentTalukaId)) {
      this.placeForm.patchValue({ TalukaID: null });
    }
  }

  onStateChange(): void {
    this.filterDistrictsByState();
  }

  onDistrictChange(): void {
    this.filterTalukasByDistrict();
  }

  getDistrictName(districtId: number | undefined): string {
    if (!districtId) return '';
    const district = this.districts.find(d => d.DistrictID === districtId);
    return district ? district.DistrictName : '';
  }

  getTalukaName(talukaId: number | undefined): string {
    if (!talukaId) return '';
    const taluka = this.talukas.find(t => t.TalukaID === talukaId);
    return taluka ? taluka.TalukaName : '';
  }

  filterPlaces(): void {
    if (!this.searchTerm) {
      this.filteredPlaces = this.places;
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredPlaces = this.places.filter(p =>
      p.PlaceCode?.toLowerCase().includes(term) ||
      p.PlaceName?.toLowerCase().includes(term) ||
      p.Pincode?.toLowerCase().includes(term) ||
      p.TalukaName?.toLowerCase().includes(term) ||
      p.DistrictName?.toLowerCase().includes(term)
    );
  }

  selectRow(id: number | undefined): void {
    if (id === undefined) {
      this.selectedRowId = null;
      return;
    }
    this.selectedRowId = this.selectedRowId === id ? null : id;
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (this.showForm) {
      this.isEditMode = false;
      this.selectedPlaceId = null;
      this.placeForm.reset({ IsActive: true, OpeningBalance: 0 });
    } else {
      this.closeForm();
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.isEditMode = false;
    this.selectedPlaceId = null;
    this.placeForm.reset({ IsActive: true, OpeningBalance: 0 });
  }

  onSubmit(): void {
    if (this.placeForm.invalid) {
      this.placeForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formData = this.placeForm.value;

    if (this.isEditMode && this.selectedPlaceId) {
      this.placeService.update(this.selectedPlaceId, formData).subscribe({
        next: () => {
          this.success = 'Place updated successfully';
          this.loadPlaces();
          this.closeForm();
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to update place';
          this.loading = false;
          console.error(err);
        }
      });
    } else {
      this.placeService.create(formData).subscribe({
        next: () => {
          this.success = 'Place created successfully';
          this.loadPlaces();
          this.closeForm();
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to create place';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  editPlace(place: Place): void {
    this.isEditMode = true;
    this.selectedPlaceId = place.PlaceID ?? null;
    this.showForm = true;
    
    // Find the district to get the StateID
    const district = this.districts.find(d => d.DistrictID === place.DistrictID);
    const stateId = district ? district.StateID : null;
    
    // First set StateID and DistrictID to filter talukas
    this.placeForm.patchValue({
      PlaceCode: place.PlaceCode,
      PlaceName: place.PlaceName,
      StateID: stateId,
      DistrictID: place.DistrictID || null,
      TalukaID: place.TalukaID || null,
      Pincode: place.Pincode || '',
      OpeningBalance: place.OpeningBalance || 0,
      IsActive: place.IsActive !== undefined ? place.IsActive : true,
      Remarks: place.Remarks || ''
    });
    
    // Filter districts and talukas after patching
    setTimeout(() => {
      this.filterDistrictsByState();
      this.filterTalukasByDistrict();
    }, 0);
  }

  deletePlace(place: Place): void {
    if (!place.PlaceID) {
      this.error = 'Invalid place ID';
      return;
    }
    if (!confirm(`Are you sure you want to delete place "${place.PlaceName}"?`)) {
      return;
    }
    this.loading = true;
    this.placeService.delete(place.PlaceID).subscribe({
      next: () => {
        this.success = 'Place deleted successfully';
        this.loadPlaces();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to delete place';
        this.loading = false;
        console.error(err);
      }
    });
  }

  editSelected(): void {
    if (!this.selectedRowId) return;
    const place = this.places.find(p => p.PlaceID === this.selectedRowId);
    if (place) {
      this.editPlace(place);
    }
  }

  deleteSelected(): void {
    if (!this.selectedRowId) return;
    const place = this.places.find(p => p.PlaceID === this.selectedRowId);
    if (place) {
      this.deletePlace(place);
    }
  }

  confirmSelected(): void {
    if (!this.selectedRowId) return;
    if (!confirm('Confirm this place?')) return;
    this.loading = true;
    this.placeService.confirm(this.selectedRowId).subscribe({
      next: () => {
        this.success = 'Place confirmed successfully';
        this.loadPlaces();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to confirm place';
        this.loading = false;
        console.error(err);
      }
    });
  }

  undoSelected(): void {
    if (!this.selectedRowId) return;
    if (!confirm('Undo confirmation for this place?')) return;
    // Assuming undo is the same as unconfirm
    this.loading = true;
    this.placeService.confirm(this.selectedRowId).subscribe({
      next: () => {
        this.success = 'Undo successful';
        this.loadPlaces();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to undo';
        this.loading = false;
        console.error(err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  applyFilter(): void {
    this.filterPlaces();
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
      if (this.placeForm.invalid) {
        Object.keys(this.placeForm.controls).forEach(key => {
          this.placeForm.get(key)?.markAsTouched();
        });
        this.error = 'Please fill all required fields before confirming';
        setTimeout(() => this.error = '', 3000);
        return;
      }

      this.loading = true;
      const placeData = this.placeForm.value;
      this.placeService.create(placeData).subscribe({
        next: (response) => {
          if (response.success) {
            if (response.data && response.data.PlaceID) {
              this.places.unshift(response.data);
              this.selectedRowId = response.data.PlaceID;
              const placeId = this.selectedRowId as number;
              this.placeService.confirm(placeId).subscribe({
                next: (confirmResponse) => {
                  this.loading = false;
                  if (confirmResponse.success) {
                    this.success = 'Place created and confirmed successfully!';
                    this.isFormFilled = true;
                    this.loadPlaces();
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
                  this.success = 'Place created successfully!';
                  this.isFormFilled = true;
                  this.loadPlaces();
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
              this.error = 'Error: No PlaceID returned from server';
              setTimeout(() => this.error = '', 3000);
            }
          } else {
            this.loading = false;
            this.error = response.message || 'Error creating place';
            setTimeout(() => this.error = '', 3000);
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Error creating place';
          setTimeout(() => this.error = '', 3000);
          console.error(err);
        }
      });
    } else if (this.showForm && this.isEditMode && this.selectedPlaceId) {
      if (this.placeForm.invalid) {
        Object.keys(this.placeForm.controls).forEach(key => {
          this.placeForm.get(key)?.markAsTouched();
        });
        this.error = 'Please fill all required fields before confirming';
        setTimeout(() => this.error = '', 3000);
        return;
      }

      this.loading = true;
      const placeData = this.placeForm.value;
      this.placeService.update(this.selectedPlaceId, placeData).subscribe({
        next: (response) => {
          if (response.success) {
            this.placeService.confirm(this.selectedPlaceId!).subscribe({
              next: (confirmResponse) => {
                this.loading = false;
                if (confirmResponse.success) {
                  this.success = 'Place updated and confirmed successfully!';
                  this.isFormFilled = true;
                  this.loadPlaces();
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
                this.success = 'Place updated successfully!';
                this.isFormFilled = true;
                this.loadPlaces();
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
            this.error = response.message || 'Error updating place';
            setTimeout(() => this.error = '', 3000);
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Error updating place';
          setTimeout(() => this.error = '', 3000);
          console.error(err);
        }
      });
    } else if (this.selectedRowId && this.selectedRowId > 0 && !this.showForm) {
      this.loading = true;
      this.placeService.confirm(this.selectedRowId as number).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.success = `Record ${this.selectedRowId} confirmed successfully!`;
            this.isFormFilled = true;
            this.loadPlaces();
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

  resetForm(): void {
    this.placeForm.reset({
      OpeningBalance: 0,
      IsActive: true,
      DistrictID: null,
      TalukaID: null,
      StateID: null
    });
    this.isEditMode = false;
    this.selectedPlaceId = null;
    this.error = '';
    this.success = '';
  }
}
