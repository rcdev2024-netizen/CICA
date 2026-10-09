import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonApp, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline, arrowDownOutline, arrowUpOutline, calendarOutline, checkmarkCircleOutline,
  chevronBackOutline, chevronDownOutline, chevronForwardOutline, closeOutline, cloudUploadOutline,
  documentTextOutline, downloadOutline, ellipsisHorizontal, filterOutline, menuOutline,
  notificationsOutline, pauseCircleOutline, peopleOutline, refreshOutline, searchOutline,
  shieldCheckmarkOutline, timeOutline, trendingUpOutline, walletOutline
} from 'ionicons/icons';
import { MockDataService, PolicyRecord } from './mock-data.service';

@Component({
  selector: 'cica-root',
  standalone: true,
  imports: [CommonModule, FormsModule, IonApp, IonContent, IonIcon],
  templateUrl: './app.component.html'
})
export class AppComponent {
  period = 'YTD';
  customStart = '2025-01-01';
  customEnd = '2025-07-31';
  showCustomDates = false;
  searchTerm = '';
  sortKey: keyof PolicyRecord = 'policy';
  sortDirection: 'asc' | 'desc' = 'asc';
  page = 1;
  pageSize = 5;
  expandedPolicy = '';
  activityOpen = typeof window !== 'undefined' && window.matchMedia('(min-width: 701px)').matches;
  refreshing = false;
  lastUpdated = 'Jul 31, 2025 · 10:24 AM';
  toast = '';
  private toastTimer?: ReturnType<typeof setTimeout>;

  readonly periods = ['Month', 'Quarter', 'YTD', 'Custom'];
  readonly kpis = [
    { title: 'Active policies', value: '2,418', change: '+12%', direction: 'up', icon: 'people-outline', tone: 'blue', points: '0,29 12,25 24,28 36,15 48,18 60,5 72,10 84,0' },
    { title: 'Issued policies', value: '1,285', change: '+10%', direction: 'up', icon: 'document-text-outline', tone: 'green', points: '0,30 12,26 24,25 36,19 48,23 60,10 72,12 84,1' },
    { title: 'Inactive policies', value: '318', change: '-6%', direction: 'down', icon: 'shield-checkmark-outline', tone: 'amber', points: '0,24 12,18 24,21 36,9 48,11 60,2 72,7 84,0' },
    { title: 'Submitted apps', value: '746', change: '+15%', direction: 'up', icon: 'cloud-upload-outline', tone: 'violet', points: '0,29 12,27 24,15 36,18 48,7 60,11 72,4 84,0' }
  ];
  readonly mix = [
    { name: 'Life', pct: 42, amount: '$1.04M', color: 'blue' },
    { name: 'Health', pct: 28, amount: '$694K', color: 'teal' },
    { name: 'Annuity', pct: 20, amount: '$496K', color: 'violet' },
    { name: 'Accident & Health', pct: 8, amount: '$198K', color: 'amber' },
    { name: 'Other', pct: 5, amount: '$124K', color: 'slate' }
  ];
  readonly monthly = [
    { title: 'Policies on hold', value: '24', change: '-4%', icon: 'time-outline', tone: 'amber', bars: [18, 25, 20, 30, 24, 34, 27, 39] },
    { title: 'Policies past due', value: '31', change: '-5%', icon: 'alert-circle-outline', tone: 'coral', bars: [23, 33, 28, 42, 36, 49, 40, 54] },
    { title: 'Billing notifications', value: '182', change: '-12%', icon: 'notifications-outline', tone: 'teal', bars: [24, 30, 26, 37, 31, 43, 36, 48] },
    { title: 'Commissions', value: '$42.8K', change: '+8%', icon: 'wallet-outline', tone: 'green', bars: [20, 25, 23, 35, 30, 43, 39, 52] }
  ];
  readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  readonly trendIssued = [20, 31, 38, 46, 57, 66, 81];
  readonly trendSubmitted = [15, 25, 32, 37, 47, 55, 68];
  readonly data: MockDataService;

  constructor(data: MockDataService) {
    this.data = data;
    addIcons({
      alertCircleOutline, arrowDownOutline, arrowUpOutline, calendarOutline, checkmarkCircleOutline,
      chevronBackOutline, chevronDownOutline, chevronForwardOutline, closeOutline, cloudUploadOutline,
      documentTextOutline, downloadOutline, ellipsisHorizontal, filterOutline, menuOutline,
      notificationsOutline, pauseCircleOutline, peopleOutline, refreshOutline, searchOutline,
      shieldCheckmarkOutline, timeOutline, trendingUpOutline, walletOutline
    });
  }

  get filteredRecords(): PolicyRecord[] {
    const term = this.searchTerm.trim().toLowerCase();
    const filtered = this.data.records.filter((r) =>
      !term || [r.policy, r.agentId, r.agent, r.email, r.line, r.status, r.client].some((v) => v.toLowerCase().includes(term))
    );
    return filtered.sort((a, b) => {
      const av = a[this.sortKey];
      const bv = b[this.sortKey];
      const result = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return this.sortDirection === 'asc' ? result : -result;
    });
  }
  get pageCount(): number { return Math.max(1, Math.ceil(this.filteredRecords.length / this.pageSize)); }
  get pageNumbers(): number[] { return Array.from({ length: this.pageCount }, (_, index) => index + 1); }
  get visibleRecords(): PolicyRecord[] { return this.filteredRecords.slice((this.page - 1) * this.pageSize, this.page * this.pageSize); }
  get firstResult(): number { return this.filteredRecords.length ? (this.page - 1) * this.pageSize + 1 : 0; }
  get lastResult(): number { return Math.min(this.page * this.pageSize, this.filteredRecords.length); }
  setPeriod(value: string): void {
    this.period = value;
    this.showCustomDates = value === 'Custom';
    if (value === 'Month') {
      this.customStart = '2025-07-01';
      this.customEnd = '2025-07-31';
    } else if (value === 'Quarter') {
      this.customStart = '2025-04-01';
      this.customEnd = '2025-06-30';
    } else if (value === 'YTD') {
      this.customStart = '2025-01-01';
      this.customEnd = '2025-07-31';
    }
    this.notify(`${value === 'Custom' ? 'Choose a date range' : value + ' view selected'}`);
  }
  applyCustomRange(): void {
    if (!this.customStart || !this.customEnd || this.customStart > this.customEnd) {
      this.notify('Choose a valid date range');
      return;
    }
    this.notify(`Showing ${this.formatDate(this.customStart)} – ${this.formatDate(this.customEnd)}`);
  }
  formatDate(value: string): string {
    if (!value) return 'Select date';
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  sortBy(key: keyof PolicyRecord): void {
    if (this.sortKey === key) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortKey = key; this.sortDirection = 'asc'; }
    this.page = 1;
  }
  searchChanged(): void { this.page = 1; }
  goPage(next: number): void { this.page = Math.min(this.pageCount, Math.max(1, next)); }
  toggleExpanded(policy: string): void { this.expandedPolicy = this.expandedPolicy === policy ? '' : policy; }
  toggleActivity(): void { this.activityOpen = !this.activityOpen; }
  openActivity(): void { this.activityOpen = true; }
  refresh(): void {
    if (this.refreshing) return;
    this.refreshing = true;
    setTimeout(() => {
      this.refreshing = false;
      this.lastUpdated = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      this.notify('Dashboard refreshed with the latest sample data');
    }, 700);
  }
  exportCsv(): void {
    const headers = ['Policy #', 'Agent ID', 'Agent Name', 'Email', 'Line of Business', 'Face Amount', 'Status', 'Client', 'Issued', 'Premium', 'Billing', 'State'];
    const rows = this.filteredRecords.map((r) => [r.policy, r.agentId, r.agent, r.email, r.line, r.amount, r.status, r.client, r.issued, r.premium, r.billing, r.state]);
    const csv = [headers, ...rows].map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    link.download = `cica-life-business-register-${this.period.toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    this.notify(`${rows.length} business records exported`);
  }
  notify(message: string): void {
    this.toast = message;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast = '', 2600);
  }
  formatMoney(value: number): string { return '$' + value.toLocaleString('en-US'); }
  trackByPolicy(_index: number, row: PolicyRecord): string { return row.policy; }
}
