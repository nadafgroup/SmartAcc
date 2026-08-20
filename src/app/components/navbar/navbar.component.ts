import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @Output() menuSelected = new EventEmitter<{ menuId: string; subMenuId: string }>();

  currentDate = new Date();
  currentTime = '12:00';
  activeDropdown: string | null = null;

  navItems = [
    { id: 'home', label: 'Home', icon: 'bi-house' },
    {
      id: 'masters',
      label: 'Masters',
      icon: 'bi-files',
      dropdown: [
        { id: 'firm', label: 'Firm', icon: 'bi-building' },
        { id: 'branches', label: 'Branches', icon: 'bi-diagram-3' },
        { id: 'financial-year', label: 'Financial Year', icon: 'bi-calendar3' },
        { id: 'balance-forward', label: 'Balance Forward', icon: 'bi-arrow-left-right' },
        { id: 'account-groups', label: 'Account Groups', icon: 'bi-folder2-open' },
        { id: 'account-info', label: 'Account Info', icon: 'bi-people' }
      ]
    },
    {
      id: 'finance',
      label: 'Finance',
      icon: 'bi-coin',
      dropdown: [
        { id: 'finance-dashboard', label: 'Dashboard', icon: 'bi-grid' },
        { id: 'transactions', label: 'Transactions', icon: 'bi-receipt' }
      ]
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: 'bi-person-gear',
      dropdown: [
        { id: 'users', label: 'Users', icon: 'bi-people' },
        { id: 'settings', label: 'Settings', icon: 'bi-gear' }
      ]
    }
  ];

  toggleDropdown(menuId: string): void {
    this.activeDropdown = this.activeDropdown === menuId ? null : menuId;
  }

  selectMenuItem(menuId: string, subMenuId: string): void {
    this.activeDropdown = null;
    this.menuSelected.emit({ menuId, subMenuId });
  }

  logout(): void {
    // Handle logout
  }
}