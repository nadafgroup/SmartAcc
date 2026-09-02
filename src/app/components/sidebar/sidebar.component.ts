import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  route: string;
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnChanges {
  @Input() activeMenu: string = 'master';
  @Input() isOpen: boolean = false;

  // Firm info
  firmPlace: string = 'KAGWAD';
  firmName: string = 'PIMPALE SUPER BAZAR (20262027)';

  // Sidebar groups
  sidebarGroups: SidebarGroup[] = [];
  menuTitle: string = '';

  // Menu configurations with groups
  private menus: { [key: string]: { title: string, groups: SidebarGroup[] } } = {
    master: {
      title: 'Master',
      groups: [
        {
          title: 'Account',
          items: [
            { id: 'account-info', label: 'Account Info', icon: 'bi-people', route: '/accounts' },
            { id: 'account-groups', label: 'Group', icon: 'bi-folder2-open', route: '/groups' },
            { id: 'primary-group', label: 'Primary Group', icon: 'bi-folder', route: '/primary-groups' },
            { id: 'opening-balance', label: 'Opening Balance', icon: 'bi-wallet2', route: '/opening-balance' }
          ]
        },
        {
          title: 'Location',
          items: [
            { id: 'district', label: 'District', icon: 'bi-geo-alt', route: '/districts' },
            { id: 'taluka', label: 'Taluka', icon: 'bi-building', route: '/talukas' },
            { id: 'place', label: 'Place', icon: 'bi-pin-map', route: '/places' }
          ]
        },
        {
          title: 'Product',
          items: [
            { id: 'products', label: 'Products', icon: 'bi-box-seam', route: '/products' }
          ]
        }
      ]
    },
    purchase: {
      title: 'Purchase',
      groups: [
        {
          title: 'Purchase',
          items: [
            { id: 'purchase-orders', label: 'Purchase Orders', icon: 'bi-file-earmark-text', route: '/purchase/orders' },
            { id: 'purchase-invoice', label: 'Purchase Invoice', icon: 'bi-file-earmark', route: '/purchase/invoice' },
            { id: 'purchase-return', label: 'Purchase Return', icon: 'bi-arrow-return-left', route: '/purchase/return' },
            { id: 'suppliers', label: 'Suppliers', icon: 'bi-people', route: '/suppliers' }
          ]
        }
      ]
    },
    sale: {
      title: 'Sale',
      groups: [
        {
          title: 'Sale',
          items: [
            { id: 'sales-orders', label: 'Sales Orders', icon: 'bi-file-earmark-text', route: '/sales/orders' },
            { id: 'sales-invoice', label: 'Sales Invoice', icon: 'bi-file-earmark', route: '/sales/invoice' },
            { id: 'sales-return', label: 'Sales Return', icon: 'bi-arrow-return-right', route: '/sales/return' },
            { id: 'customers', label: 'Customers', icon: 'bi-people', route: '/customers' }
          ]
        }
      ]
    },
    finance: {
      title: 'Finance',
      groups: [
        {
          title: 'Finance',
          items: [
            { id: 'dashboard', label: 'Dashboard', icon: 'bi-grid-1x2', route: '/dashboard' },
            { id: 'transactions', label: 'Transactions', icon: 'bi-receipt', route: '/transactions' },
            { id: 'vouchers', label: 'Vouchers', icon: 'bi-journal', route: '/vouchers' },
            { id: 'ledger', label: 'Ledger', icon: 'bi-book', route: '/ledger' },
            { id: 'trial-balance', label: 'Trial Balance', icon: 'bi-balance', route: '/trial-balance' }
          ]
        }
      ]
    },
    admin: {
      title: 'Admin',
      groups: [
        {
          title: 'Master',
          items: [
            { id: 'firm', label: 'Firm', icon: 'bi-building', route: '/firms' },
            { id: 'branches', label: 'Branches', icon: 'bi-diagram-3', route: '/branches' },
            { id: 'financial-year', label: 'Financial Year', icon: 'bi-calendar3', route: '/financial-year' },
            { id: 'balance-forward', label: 'Balance Forward', icon: 'bi-arrow-left-right', route: '/balance-forward' },
            { id: 'district', label: 'District', icon: 'bi-geo-alt', route: '/districts' },
            { id: 'taluka', label: 'Taluka', icon: 'bi-building', route: '/talukas' },
            { id: 'place', label: 'Place', icon: 'bi-pin-map', route: '/places' }
          ]
        },
        {
          title: 'Security',
          items: [
            { id: 'users', label: 'Users', icon: 'bi-people', route: '/users' },
            { id: 'roles', label: 'Roles & Permissions', icon: 'bi-shield', route: '/roles' },
            { id: 'audit', label: 'Audit Logs', icon: 'bi-clock-history', route: '/audit' }
          ]
        },
        {
          title: 'Settings',
          items: [
            { id: 'application-settings', label: 'Application Settings', icon: 'bi-gear', route: '/settings' },
            { id: 'voucher-pages', label: 'Voucher Pages', icon: 'bi-file-text', route: '/voucher-pages' }
          ]
        }
      ]
    }
  };

  constructor() {
    this.loadMenu('master');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeMenu']) {
      this.loadMenu(this.activeMenu);
    }
  }

  loadMenu(menuId: string): void {
    const menu = this.menus[menuId] || this.menus['master'];
    this.menuTitle = menu.title;
    this.sidebarGroups = menu.groups;
  }

  toggleFirmInfo(): void {
    // Toggle firm info if needed
  }

  closeSidebar(): void {
    console.log('closeSidebar called, isOpen before:', this.isOpen);
    this.isOpen = false;
    console.log('closeSidebar, isOpen after:', this.isOpen);
  }

  navigateAndClose(route: string): void {
    console.log('navigateAndClose called with route:', route);
    // Close the sidebar first
    this.isOpen = false;
    // Use Router to navigate after a small delay to ensure sidebar closes
    setTimeout(() => {
      // Find the Router instance from the DI
      const router = (this as any).router;
      if (router) {
        console.log('Navigating to:', route);
        router.navigate([route]);
      } else {
        console.error('Router not available');
      }
    }, 100);
  }
}