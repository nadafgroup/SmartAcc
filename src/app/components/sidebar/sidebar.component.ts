import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() activeMenu: string = 'masters';

  menuItems: any[] = [];

  private menus: { [key: string]: any[] } = {
    masters: [
      { id: 'firm', label: 'Firm', icon: 'bi-building', route: '/firms' },
      { id: 'branches', label: 'Branches', icon: 'bi-diagram-3', route: '/branches' },
      { id: 'financial-year', label: 'Financial Year', icon: 'bi-calendar3', route: '/financial-year' },
      { id: 'balance-forward', label: 'Balance Forward', icon: 'bi-arrow-left-right', route: '/balance-forward' },
      { id: 'account-groups', label: 'Account Groups', icon: 'bi-folder2-open', route: '/groups' },
      { id: 'account-info', label: 'Account Info', icon: 'bi-people', route: '/accounts' }
    ],

    finance: [
      { id: 'finance-dashboard', label: 'Finance Dashboard', icon: 'bi-grid', route: '/dashboard' },
      { id: 'transactions', label: 'Transactions', icon: 'bi-receipt', route: '/transactions' }
    ],

    admin: [
      { id: 'users', label: 'Users', icon: 'bi-people', route: '/users' },
      { id: 'settings', label: 'Settings', icon: 'bi-gear', route: '/settings' }
    ],

    home: [
      { id: 'dashboard', label: 'Dashboard', icon: 'bi-grid-1x2', route: '/dashboard' }
    ]
  };

  constructor() {
    this.menuItems = this.menus[this.activeMenu] || this.menus['masters'];
  }

  get menuTitle(): string {
    const titles: { [key: string]: string } = {
      home: 'Home',
      masters: 'Masters',
      finance: 'Finance',
      admin: 'Admin'
    };

    return titles[this.activeMenu] || 'Menu';
  }
}