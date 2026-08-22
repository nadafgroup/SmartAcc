import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @Output() menuSelected = new EventEmitter<string>();

  activeMenu: string = 'master';
  currentDate: Date = new Date();
  currentTime: string = '';

  // Top-level menu items
  navItems: NavItem[] = [
    { id: 'master', label: 'Master', icon: 'bi-files' },
    { id: 'purchase', label: 'Purchase', icon: 'bi-bag' },
    { id: 'sale', label: 'Sale', icon: 'bi-cart' },
    { id: 'finance', label: 'Finance', icon: 'bi-coin' },
    { id: 'admin', label: 'Admin', icon: 'bi-person-gear' }
  ];

  constructor(private router: Router) {
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
  }

  updateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  selectMenu(menuId: string): void {
    this.activeMenu = menuId;
    this.menuSelected.emit(menuId);
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}