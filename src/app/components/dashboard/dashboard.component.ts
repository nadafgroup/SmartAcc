import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats = [
    { 
      title: 'Total Accounts', 
      value: '1,284', 
      icon: 'bi-people-fill', 
      color: 'primary',
      change: '+12.5%'
    },
    { 
      title: 'Total Groups', 
      value: '156', 
      icon: 'bi-folder2-open', 
      color: 'success',
      change: '+8.2%'
    },
    { 
      title: 'Transactions', 
      value: '43,892', 
      icon: 'bi-receipt', 
      color: 'warning',
      change: '+23.1%'
    },
    { 
      title: 'Revenue', 
      value: '₹12,45,890', 
      icon: 'bi-currency-rupee', 
      color: 'danger',
      change: '+18.7%'
    }
  ];

  recentTransactions = [
    { id: 1, date: '2026-08-14', description: 'Purchase from Vendor A', amount: 25000, type: 'debit' },
    { id: 2, date: '2026-08-14', description: 'Sales Invoice #INV-001', amount: 45000, type: 'credit' },
    { id: 3, date: '2026-08-13', description: 'Salary Payment', amount: 35000, type: 'debit' },
    { id: 4, date: '2026-08-13', description: 'Bank Interest Received', amount: 1200, type: 'credit' },
    { id: 5, date: '2026-08-12', description: 'Purchase Return', amount: 5000, type: 'credit' }
  ];

  constructor() {}

  ngOnInit(): void {}
}