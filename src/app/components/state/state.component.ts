import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StateService, State } from '../../services/state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-state',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './state.component.html',
  styleUrls: ['./state.component.scss']
})
export class StateComponent implements OnInit, OnDestroy {
  states: State[] = [];
  filteredStates: State[] = [];
  selectedRowId: number | null = null;
  searchTerm: string = '';
  loading: boolean = false;
  error: string = '';
  success: string = '';
  showForm: boolean = false;
  isEditMode: boolean = false;
  stateForm: FormGroup;
  private subscriptions: Subscription[] = [];

  constructor(
    private stateService: StateService,
    private fb: FormBuilder
  ) {
    this.stateForm = this.fb.group({
      StateCode: ['', Validators.required],
      StateName: ['', Validators.required],
      OpeningBalance: [0],
      IsActive: [true],
      Remarks: ['']
    });
  }

  ngOnInit(): void {
    this.loadStates();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadStates(): void {
    this.loading = true;
    this.error = '';
    this.subscriptions.push(
      this.stateService.getAll().subscribe({
        next: (res) => {
          this.states = res.data || [];
          this.filteredStates = [...this.states];
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load states. Please try again.';
          this.loading = false;
          console.error('Error loading states:', err);
        }
      })
    );
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.isEditMode = false;
      this.resetForm();
      this.selectedRowId = null;
    }
  }

  resetForm(): void {
    this.stateForm.reset({
      StateCode: '',
      StateName: '',
      OpeningBalance: 0,
      IsActive: true,
      Remarks: ''
    });
    this.isEditMode = false;
  }

  selectRow(id: number): void {
    this.selectedRowId = this.selectedRowId === id ? null : id;
  }

  onEdit(): void {
    if (!this.selectedRowId) return;
    const state = this.states.find(s => s.StateID === this.selectedRowId);
    if (state) {
      this.isEditMode = true;
      this.showForm = true;
      this.stateForm.patchValue({
        StateCode: state.StateCode,
        StateName: state.StateName,
        OpeningBalance: state.OpeningBalance || 0,
        IsActive: state.IsActive !== undefined ? state.IsActive : true,
        Remarks: state.Remarks || ''
      });
    }
  }

  editState(state: State): void {
    this.selectedRowId = state.StateID!;
    this.onEdit();
  }

  onSubmit(): void {
    if (this.stateForm.invalid) {
      Object.keys(this.stateForm.controls).forEach(key => {
        this.stateForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';
    const formData = this.stateForm.value;

    if (this.isEditMode && this.selectedRowId) {
      this.subscriptions.push(
        this.stateService.update(this.selectedRowId, formData).subscribe({
          next: () => {
            this.success = 'State updated successfully!';
            this.loading = false;
            this.loadStates();
            this.toggleForm();
          },
          error: (err) => {
            this.error = 'Failed to update state. Please try again.';
            this.loading = false;
            console.error('Error updating state:', err);
          }
        })
      );
    } else {
      this.subscriptions.push(
        this.stateService.create(formData).subscribe({
          next: () => {
            this.success = 'State created successfully!';
            this.loading = false;
            this.loadStates();
            this.toggleForm();
          },
          error: (err) => {
            this.error = 'Failed to create state. Please try again.';
            this.loading = false;
            console.error('Error creating state:', err);
          }
        })
      );
    }
  }

  deleteState(id: number): void {
    if (!confirm('Are you sure you want to delete this state?')) return;
    this.loading = true;
    this.error = '';
    this.subscriptions.push(
      this.stateService.delete(id).subscribe({
        next: () => {
          this.success = 'State deleted successfully!';
          this.loading = false;
          this.loadStates();
          if (this.selectedRowId === id) this.selectedRowId = null;
        },
        error: (err) => {
          this.error = 'Failed to delete state. Please try again.';
          this.loading = false;
          console.error('Error deleting state:', err);
        }
      })
    );
  }

  deleteSelected(): void {
    if (this.selectedRowId) {
      this.deleteState(this.selectedRowId);
    }
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredStates = [...this.states];
      return;
    }
    this.filteredStates = this.states.filter(state =>
      state.StateCode?.toLowerCase().includes(term) ||
      state.StateName?.toLowerCase().includes(term)
    );
  }

  onPrint(): void {
    // Print functionality
    window.print();
  }

  onAttach(): void {
    // Attach functionality
    alert('Attach file functionality coming soon.');
  }

  onConfirm(): void {
    if (!this.selectedRowId) return;
    if (!confirm('Confirm this record?')) return;
    this.loading = true;
    this.subscriptions.push(
      this.stateService.confirm(this.selectedRowId).subscribe({
        next: () => {
          this.success = 'State confirmed successfully!';
          this.loading = false;
          this.loadStates();
        },
        error: (err) => {
          this.error = 'Failed to confirm state. Please try again.';
          this.loading = false;
          console.error('Error confirming state:', err);
        }
      })
    );
  }

  onUndo(): void {
    if (!this.showForm) return;
    this.resetForm();
    this.success = 'Form reset.';
  }

  onClose(): void {
    if (this.showForm) return;
    // Close the page
    window.close ? window.close() : alert('Close functionality triggered.');
  }

  cancel(): void {
    this.toggleForm();
  }
}
