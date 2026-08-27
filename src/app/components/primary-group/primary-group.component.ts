import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-primary-group',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-4">
      <h2>Primary Group</h2>
      <p>Primary Group management will be implemented here.</p>
    </div>
  `,
  styles: []
})
export class PrimaryGroupComponent {}
