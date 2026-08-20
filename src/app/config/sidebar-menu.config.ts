export interface SidebarMenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  children?: SidebarMenuItem[];
  expanded?: boolean;
}

export const SIDEBAR_MENUS: { [key: string]: SidebarMenuItem[] } = {
  // Home Menu
  home: [
    { id: 'dashboard', label: 'Dashboard', icon: 'bi-grid-1x2', route: '/dashboard' },
    { id: 'home-analytics', label: 'Analytics', icon: 'bi-graph-up', route: '/analytics' }
  ],

  // Masters Menu
  masters: [
    { 
      id: 'firms', 
      label: 'Firm', 
      icon: 'bi-building',
      route: '/firms',
      expanded: true
    },
    { 
      id: 'branches', 
      label: 'Branches', 
      icon: 'bi-diagram-3',
      children: [
        { id: 'branch-list', label: 'Branch List', icon: 'bi-list', route: '/branches' },
        { id: 'branch-add', label: 'Add Branch', icon: 'bi-plus-circle', route: '/branches/add' }
      ]
    },
    { id: 'financial-year', label: 'Financial Year', icon: 'bi-calendar3', route: '/financial-year' },
    { id: 'balance-forward', label: 'Balance Forward', icon: 'bi-arrow-left-right', route: '/balance-forward' },
    { id: 'firm-type', label: 'Firm Type', icon: 'bi-building', route: '/firm-type' },
    { id: 'create-counter', label: 'Create Counter', icon: 'bi-plus-circle', route: '/create-counter' },
    { id: 'account-groups', label: 'Account Groups', icon: 'bi-folder2-open', route: '/groups' },
    { id: 'account-info', label: 'Account Info', icon: 'bi-people', route: '/accounts' }
  ],

  // Finance Menu
  finance: [
    { id: 'finance-dashboard', label: 'Finance Dashboard', icon: 'bi-grid', route: '/finance' },
    { id: 'transactions', label: 'Transactions', icon: 'bi-receipt', route: '/transactions' },
    { id: 'vouchers', label: 'Vouchers', icon: 'bi-journal', route: '/vouchers' }
  ],

  // Sale Menu
  sale: [
    { id: 'sales-orders', label: 'Sales Orders', icon: 'bi-cart', route: '/sales' },
    { id: 'sales-invoice', label: 'Sales Invoice', icon: 'bi-file-text', route: '/sales/invoice' },
    { id: 'sales-returns', label: 'Sales Returns', icon: 'bi-arrow-return-left', route: '/sales/returns' }
  ],

  // Purchase Menu
  purchase: [
    { id: 'purchase-orders', label: 'Purchase Orders', icon: 'bi-bag', route: '/purchase' },
    { id: 'purchase-invoice', label: 'Purchase Invoice', icon: 'bi-file-text', route: '/purchase/invoice' },
    { id: 'purchase-returns', label: 'Purchase Returns', icon: 'bi-arrow-return-left', route: '/purchase/returns' }
  ],

  // Admin Menu
  admin: [
    { id: 'users', label: 'Users', icon: 'bi-people', route: '/users' },
    { id: 'roles', label: 'Roles & Permissions', icon: 'bi-shield', route: '/roles' },
    { id: 'settings', label: 'Settings', icon: 'bi-gear', route: '/settings' },
    { id: 'audit', label: 'Audit Logs', icon: 'bi-clock-history', route: '/audit' }
  ]
};