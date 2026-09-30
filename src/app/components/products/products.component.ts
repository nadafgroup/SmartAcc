import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ProductsService } from '../../services/products.service.js';

interface Product {
  ProductID?: number;
  ProductCode: string;
  ProductName: string;
  Category: string;
  Price: number;
  StockQuantity: number;
  IsActive: boolean;
  Remarks?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedRowId: number | null = null;
  showForm: boolean = false;
  isEditMode: boolean = false;
  loading: boolean = false;
  error: string = '';
  success: string = '';
  searchTerm: string = '';
  isFormFilled: boolean = false;

  productForm!: FormGroup;
  categories: string[] = ['Electronics', 'Furniture', 'Clothing', 'Food', 'Books', 'Office Supplies', 'Other'];

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProducts();
  }

  initForm(): void {
    this.productForm = this.fb.group({
      ProductCode: ['', [Validators.required]],
      ProductName: ['', [Validators.required]],
      Category: ['', [Validators.required]],
      Price: [0, [Validators.required, Validators.min(0)]],
      StockQuantity: [0, [Validators.required, Validators.min(0)]],
      IsActive: [true],
      Remarks: ['']
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.productsService.getAll().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = [...this.products];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load products. Please try again.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  toggleForm(): void {
    if (this.showForm) {
      this.showForm = false;
      this.isEditMode = false;
      this.productForm.reset({ IsActive: true, Price: 0, StockQuantity: 0 });
      this.selectedRowId = null;
    } else {
      this.showForm = true;
      this.isEditMode = false;
      this.productForm.reset({ IsActive: true, Price: 0, StockQuantity: 0 });
      this.selectedRowId = null;
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      Object.keys(this.productForm.controls).forEach(key => {
        const control = this.productForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const formData = this.productForm.value;

    if (this.isEditMode && this.selectedRowId) {
      this.productsService.update(this.selectedRowId, formData).subscribe({
        next: () => {
          this.success = 'Product updated successfully!';
          this.loadProducts();
          this.toggleForm();
        },
        error: (err) => {
          this.error = 'Failed to update product. Please try again.';
          console.error(err);
        }
      });
    } else {
      this.productsService.create(formData).subscribe({
        next: () => {
          this.success = 'Product created successfully!';
          this.loadProducts();
          this.toggleForm();
        },
        error: (err) => {
          this.error = 'Failed to create product. Please try again.';
          console.error(err);
        }
      });
    }
  }

  editProduct(product: Product): void {
    this.selectedRowId = product.ProductID || null;
    this.isEditMode = true;
    this.showForm = true;
    this.productForm.patchValue({
      ProductCode: product.ProductCode,
      ProductName: product.ProductName,
      Category: product.Category,
      Price: product.Price,
      StockQuantity: product.StockQuantity,
      IsActive: product.IsActive,
      Remarks: product.Remarks || ''
    });
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productsService.delete(id).subscribe({
        next: () => {
          this.success = 'Product deleted successfully!';
          this.loadProducts();
          if (this.selectedRowId === id) {
            this.selectedRowId = null;
          }
        },
        error: (err) => {
          this.error = 'Failed to delete product. Please try again.';
          console.error(err);
        }
      });
    }
  }

  deleteSelected(): void {
    if (this.selectedRowId) {
      this.deleteProduct(this.selectedRowId);
    }
  }

  selectRow(id: number): void {
    this.selectedRowId = this.selectedRowId === id ? null : id;
  }

  onEdit(): void {
    if (this.selectedRowId) {
      const product = this.products.find(p => p.ProductID === this.selectedRowId);
      if (product) {
        this.editProduct(product);
      }
    }
  }

  applyFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filteredProducts = [...this.products];
      return;
    }
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredProducts = this.products.filter(p =>
      p.ProductCode.toLowerCase().includes(term) ||
      p.ProductName.toLowerCase().includes(term) ||
      p.Category.toLowerCase().includes(term)
    );
  }

  onPrint(): void {
    window.print();
  }

  onAttach(): void {
    alert('Attach file functionality will be implemented soon.');
  }

  onConfirm(): void {
    // Add new record: save then confirm
    if (this.showForm && this.selectedRowId === -1) {
      if (this.productForm.invalid) {
        Object.keys(this.productForm.controls).forEach(key => {
          this.productForm.get(key)?.markAsTouched();
        });
        this.error = 'Please fill all required fields before confirming';
        setTimeout(() => this.error = '', 3000);
        return;
      }

      this.loading = true;
      const formData = this.productForm.value;
      this.productsService.create(formData).subscribe({
        next: (product: any) => {
          const newId = product && product.ProductID ? product.ProductID : null;
          if (newId) {
            this.selectedRowId = newId;
            this.productsService.confirm(newId).subscribe({
              next: () => {
                this.loading = false;
                this.success = 'Product created and confirmed successfully!';
                this.isFormFilled = true;
                this.loadProducts();
                setTimeout(() => {
                  this.success = '';
                  this.toggleForm();
                  this.selectedRowId = null;
                  this.isFormFilled = false;
                }, 2000);
              },
              error: (err: any) => {
                this.loading = false;
                this.success = 'Product created successfully!';
                this.isFormFilled = true;
                this.loadProducts();
                setTimeout(() => {
                  this.success = '';
                  this.toggleForm();
                  this.selectedRowId = null;
                  this.isFormFilled = false;
                }, 3000);
                console.error('Confirm error:', err);
              }
            });
          } else {
            this.loading = false;
            this.success = 'Product created successfully!';
            this.loadProducts();
            setTimeout(() => {
              this.success = '';
              this.toggleForm();
            }, 1500);
          }
        },
        error: (err: any) => {
          this.loading = false;
          this.error = err.error?.message || 'Failed to create product. Please try again.';
          setTimeout(() => this.error = '', 3000);
          console.error(err);
        }
      });
    } else if (this.showForm && this.isEditMode && this.selectedRowId) {
      // Edit mode: update then confirm
      if (this.productForm.invalid) {
        Object.keys(this.productForm.controls).forEach(key => {
          this.productForm.get(key)?.markAsTouched();
        });
        this.error = 'Please fill all required fields before confirming';
        setTimeout(() => this.error = '', 3000);
        return;
      }

      this.loading = true;
      const formData = this.productForm.value;
      this.productsService.update(this.selectedRowId, formData).subscribe({
        next: () => {
          this.productsService.confirm(this.selectedRowId!).subscribe({
            next: () => {
              this.loading = false;
              this.success = 'Product updated and confirmed successfully!';
              this.isFormFilled = true;
              this.loadProducts();
              setTimeout(() => {
                this.success = '';
                this.toggleForm();
                this.selectedRowId = null;
                this.isFormFilled = false;
              }, 2000);
            },
            error: (err: any) => {
              this.loading = false;
              this.success = 'Product updated successfully!';
              this.isFormFilled = true;
              this.loadProducts();
              setTimeout(() => {
                this.success = '';
                this.toggleForm();
                this.selectedRowId = null;
                this.isFormFilled = false;
              }, 3000);
              console.error('Confirm error:', err);
            }
          });
        },
        error: (err: any) => {
          this.loading = false;
          this.error = err.error?.message || 'Failed to update product. Please try again.';
          setTimeout(() => this.error = '', 3000);
          console.error(err);
        }
      });
    } else if (this.selectedRowId && this.selectedRowId > 0 && !this.showForm) {
      // Confirm an existing saved record
      this.loading = true;
      const productId = this.selectedRowId;
      this.productsService.confirm(productId).subscribe({
        next: () => {
          this.loading = false;
          this.success = `Record ${productId} confirmed successfully!`;
          this.isFormFilled = true;
          this.loadProducts();
          setTimeout(() => {
            this.success = '';
            this.selectedRowId = null;
            this.isFormFilled = false;
          }, 2000);
        },
        error: (err: any) => {
          this.loading = false;
          this.error = err.error?.message || 'Failed to confirm product. Please try again.';
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
    this.showForm = false;
    this.isEditMode = false;
    this.productForm.reset({ IsActive: true, Price: 0, StockQuantity: 0 });
    this.selectedRowId = null;
    this.isFormFilled = false;
    this.success = 'Undo successful - changes reverted';
    setTimeout(() => this.success = '', 3000);
  }

  onClose(): void {
    this.showForm = false;
    this.isEditMode = false;
    this.productForm.reset({ IsActive: true, Price: 0, StockQuantity: 0 });
    this.selectedRowId = null;
    this.isFormFilled = false;
    this.router.navigate(['/dashboard']);
  }
}
