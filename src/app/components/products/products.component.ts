import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
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

  productForm!: FormGroup;
  categories: string[] = ['Electronics', 'Furniture', 'Clothing', 'Food', 'Books', 'Office Supplies', 'Other'];

  constructor(
    private fb: FormBuilder,
    private productsService: ProductsService
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
    if (this.selectedRowId) {
      this.productsService.update(this.selectedRowId, { IsActive: true }).subscribe({
        next: () => {
          this.success = 'Product confirmed successfully!';
          this.loadProducts();
        },
        error: (err) => {
          this.error = 'Failed to confirm product. Please try again.';
          console.error(err);
        }
      });
    }
  }

  onUndo(): void {
    this.toggleForm();
  }

  onClose(): void {
    this.selectedRowId = null;
    this.toggleForm();
  }
}
