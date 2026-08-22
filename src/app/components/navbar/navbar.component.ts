import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface DropdownItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  dropdown?: DropdownItem[];
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @Output() menuSelected = new EventEmitter<{ menuId: string; subMenuId: string }>();

  currentDate = new Date();
  currentTime = '12:00';
  activeDropdown: string | null = null;

  navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: 'bi-house' },
    {
      id: 'masters',
      label: 'Masters',
      icon: 'bi-files',
      dropdown: [
        { id: 'firm', label: 'Firm', icon: 'bi-building', route: '/firms' },
        { id: 'branches', label: 'Branches', icon: 'bi-diagram-3', route: '/branches' },
        { id: 'financial-year', label: 'Financial Year', icon: 'bi-calendar3', route: '/financial-year' },
        { id: 'balance-forward', label: 'Balance Forward', icon: 'bi-arrow-left-right', route: '/balance-forward' },
        { id: 'account-groups', label: 'Account Groups', icon: 'bi-folder2-open', route: '/groups' },
        { id: 'account-info', label: 'Account Info', icon: 'bi-people', route: '/accounts' }
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