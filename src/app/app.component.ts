import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonApp, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { ClickSpinnerDirective } from './click-spinner.directive';
import {
  alertCircleOutline, arrowDownOutline, arrowUpOutline, calendarOutline, checkmarkCircleOutline,
  chevronBackOutline, chevronDownOutline, chevronForwardOutline, closeOutline, cloudUploadOutline,
  documentTextOutline, downloadOutline, ellipsisHorizontal, filterOutline, menuOutline,
  notificationsOutline, pauseCircleOutline, peopleOutline, refreshOutline, searchOutline,
  shieldCheckmarkOutline, timeOutline, trendingUpOutline, walletOutline
} from 'ionicons/icons';
import { AgentRosterRecord, MockDataService, PolicyRecord } from './mock-data.service';

type DashboardKpi = {
  title: string;
  value: string;
  change: string;
  direction: 'up' | 'down';
  icon: string;
  tone: string;
  points: string;
};

@Component({
  selector: 'cica-root',
  standalone: true,
  imports: [CommonModule, FormsModule, IonApp, IonContent, IonIcon, ClickSpinnerDirective],
  templateUrl: './app.component.html'
})
export class AppComponent {
  dashboardMode: 'agent' | 'agency' = 'agent';
  productionScope: 'overall' | 'agency' | 'agent' = 'agency';
  agentNameFilter = '';
  period = 'YTD';
  customStart = '2026-01-01';
  customEnd = '2026-07-31';
  showCustomDates = false;
  searchTerm = '';
  sortKey: keyof PolicyRecord = 'policy';
  sortDirection: 'asc' | 'desc' = 'asc';
  rosterSearchTerm = '';
  rosterSortKey: keyof AgentRosterRecord = 'agentNumber';
  rosterSortDirection: 'asc' | 'desc' = 'asc';
  rosterPage = 1;
  rosterPageSize = 5;
  page = 1;
  pageSize = 5;
  expandedPolicy = '';
  expandedAgentNumber = '';
  activityOpen = typeof window !== 'undefined' && window.matchMedia('(min-width: 701px)').matches;
  refreshing = false;
  lastUpdated = 'Jul 31, 2026 · 10:24 AM';
  toast = '';
  private toastTimer?: ReturnType<typeof setTimeout>;

  readonly periods = ['Month', 'Quarter', 'YTD', 'Custom'];
  readonly kpis: DashboardKpi[] = [
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
  readonly persistence = [
    { m: '1 mo', v: 91 },
    { m: '3 mo', v: 88 },
    { m: '6 mo', v: 84 },
    { m: '12 mo', v: 81 },
    { m: '18 mo', v: 73 }
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
    const filtered = this.scopedRecords.filter((r) =>
      !term || [r.policy, r.agentId, r.agent, r.email, r.line, r.status, r.client].some((v) => v.toLowerCase().includes(term))
    );
    return filtered.sort((a, b) => {
      const av = a[this.sortKey];
      const bv = b[this.sortKey];
      const result = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return this.sortDirection === 'asc' ? result : -result;
    });
  }
  get scopedRecords(): PolicyRecord[] { return this.applyProductionScope(this.data.records); }
  get allScopedRecords(): PolicyRecord[] { return this.applyProductionScope(this.data.records, false); }
  get dashboardKpis(): DashboardKpi[] {
    if (this.dashboardMode === 'agent') return this.kpis;
    const records = this.scopedRecords;
    const producingAgents = new Set(
      records.filter((record) => record.status === 'Active' || record.status === 'Submitted').map((record) => record.agentId)
    ).size;
    const commissionTotal = records.reduce((sum, record) => {
      const agent = this.data.agentRoster.find((item) => item.agentNumber === record.agentId);
      return sum + record.premium * ((agent?.commissionPercentage ?? 0) / 100);
    }, 0);
    return [
      { title: 'Policies in period', value: String(records.length), change: 'Sample', direction: 'up', icon: 'document-text-outline', tone: 'blue', points: '0,29 12,25 24,27 36,16 48,17 60,10 72,11 84,2' },
      { title: 'Face amount', value: this.formatCompactMoney(records.reduce((sum, record) => sum + record.amount, 0)), change: 'Sample', direction: 'up', icon: 'wallet-outline', tone: 'green', points: '0,30 12,26 24,25 36,20 48,22 60,12 72,8 84,1' },
      { title: 'Producing agents', value: String(producingAgents), change: 'Sample', direction: 'up', icon: 'people-outline', tone: 'amber', points: '0,25 12,19 24,21 36,16 48,13 60,9 72,7 84,1' },
      { title: 'Estimated commissions', value: this.formatCompactMoney(commissionTotal), change: 'Sample', direction: 'up', icon: 'trending-up-outline', tone: 'violet', points: '0,29 12,23 24,26 36,17 48,18 60,10 72,12 84,2' }
    ];
  }
  get agencyMonthlyCards() {
    const records = this.scopedRecords;
    const allRecords = this.allScopedRecords;
    const periodFactor = allRecords.length ? records.length / allRecords.length : 0;
    const holdCount = records.filter((record) => record.status === 'On hold').length;
    const pastDue = Math.round(31 * periodFactor);
    const billingNotifications = Math.round(182 * periodFactor);
    const commission = records.reduce((sum, record) => {
      const agent = this.data.agentRoster.find((item) => item.agentNumber === record.agentId);
      return sum + record.premium * ((agent?.commissionPercentage ?? 0) / 100);
    }, 0);
    return [
      { title: 'Policies on hold', value: String(holdCount), tone: 'amber', months: ['Mar', 'Apr', 'May', 'Jun', 'Jul'], bars: [18, 25, 20, 30, 24].map((value) => Math.round(value * periodFactor)) },
      { title: 'Policies past due', value: String(pastDue), tone: 'coral', months: ['Mar', 'Apr', 'May', 'Jun', 'Jul'], bars: [35, 42, 36, 49, 40].map((value) => Math.round(value * periodFactor)) },
      { title: 'Billing notifications', value: String(billingNotifications), tone: 'teal', months: ['Mar', 'Apr', 'May', 'Jun', 'Jul'], bars: [26, 37, 31, 43, 36].map((value) => Math.round(value * periodFactor)) },
      { title: 'Commissions', value: this.formatCompactMoney(commission), tone: 'blue', months: ['Mar', 'Apr', 'May', 'Jun', 'Jul'], bars: [24, 31, 38, 34, 46].map((value) => Math.round(value * periodFactor)) }
    ];
  }
  get agencyRosterRows(): AgentRosterRecord[] {
    if (this.dashboardMode !== 'agency') return [];
    const name = this.agentNameFilter.trim().toLowerCase();
    return this.data.agentRoster.filter((agent) => {
      if (this.productionScope === 'agency' && !agent.agencyMember) return false;
      if (this.productionScope === 'agent' && !name) return false;
      return !name || [agent.agentName, agent.agentNumber].some((value) => value.toLowerCase().includes(name));
    });
  }
  get filteredRoster(): AgentRosterRecord[] {
    const term = this.rosterSearchTerm.trim().toLowerCase();
    return this.agencyRosterRows
      .filter((agent) =>
        !term || [
          agent.agentNumber, agent.agentName, agent.uplineHierarchy, agent.contractCode,
          agent.level, agent.advanceVsAsEarned
        ].some((value) => value.toLowerCase().includes(term))
      )
      .sort((a, b) => {
        const left = a[this.rosterSortKey];
        const right = b[this.rosterSortKey];
        const result = typeof left === 'number' && typeof right === 'number'
          ? left - right
          : String(left).localeCompare(String(right));
        return this.rosterSortDirection === 'asc' ? result : -result;
      });
  }
  get rosterPageCount(): number { return Math.max(1, Math.ceil(this.filteredRoster.length / this.rosterPageSize)); }
  get rosterPageNumbers(): number[] { return Array.from({ length: this.rosterPageCount }, (_, index) => index + 1); }
  get visibleRosterRows(): AgentRosterRecord[] {
    return this.filteredRoster.slice((this.rosterPage - 1) * this.rosterPageSize, this.rosterPage * this.rosterPageSize);
  }
  get rosterFirstResult(): number { return this.filteredRoster.length ? (this.rosterPage - 1) * this.rosterPageSize + 1 : 0; }
  get rosterLastResult(): number { return Math.min(this.rosterPage * this.rosterPageSize, this.filteredRoster.length); }
  get agencyDataMetrics(): { label: string; value: number; barWidth: number }[] {
    const producingAgentIds = new Set(
      this.scopedRecords.filter((record) => record.status === 'Active' || record.status === 'Submitted').map((record) => record.agentId)
    );
    const metrics = [
      { label: '# of Agents', value: this.agencyRosterRows.length },
      { label: '# Producing Agents', value: producingAgentIds.size },
      { label: '# of Downlines', value: this.agencyRosterRows.filter((agent) => agent.agencyMember).length }
    ];
    const maxValue = Math.max(1, ...metrics.map((metric) => metric.value));
    return metrics.map((metric) => ({
      ...metric,
      barWidth: metric.value ? Math.max(4, Math.round((metric.value / maxValue) * 100)) : 0
    }));
  }
  get productionScopeLabel(): string {
    if (this.productionScope === 'overall') return 'Overall production';
    if (this.productionScope === 'agency') return 'Agency production';
    return 'Agent production';
  }
  scopedRecordsForAgent(agentNumber: string): number {
    return this.scopedRecords.filter((record) => record.agentId === agentNumber).length;
  }
  private applyProductionScope(records: PolicyRecord[], applyDateRange = true): PolicyRecord[] {
    if (this.dashboardMode !== 'agency') {
      return applyDateRange ? records.filter((record) => this.isWithinDateRange(record)) : records;
    }
    const name = this.agentNameFilter.trim().toLowerCase();
    const rosterById = new Map(this.data.agentRoster.map((agent) => [agent.agentNumber, agent]));
    if (this.productionScope === 'agent' && !name) return [];
    return records.filter((record) => {
      const rosterAgent = rosterById.get(record.agentId);
      if (this.productionScope === 'agency' && !rosterAgent?.agencyMember) return false;
      const matchesName = !name || [record.agent, record.agentId, record.email].some((value) => value.toLowerCase().includes(name));
      return matchesName && (!applyDateRange || this.isWithinDateRange(record));
    });
  }
  private isWithinDateRange(record: PolicyRecord): boolean {
    const issued = new Date(record.issued);
    const key = `${issued.getFullYear()}-${String(issued.getMonth() + 1).padStart(2, '0')}-${String(issued.getDate()).padStart(2, '0')}`;
    return (!this.customStart || key >= this.customStart) && (!this.customEnd || key <= this.customEnd);
  }
  get pageCount(): number { return Math.max(1, Math.ceil(this.filteredRecords.length / this.pageSize)); }
  get averagePersistence(): number {
    return this.persistence.reduce((total, item) => total + item.v, 0) / this.persistence.length;
  }
  get pageNumbers(): number[] { return Array.from({ length: this.pageCount }, (_, index) => index + 1); }
  get visibleRecords(): PolicyRecord[] { return this.filteredRecords.slice((this.page - 1) * this.pageSize, this.page * this.pageSize); }
  get firstResult(): number { return this.filteredRecords.length ? (this.page - 1) * this.pageSize + 1 : 0; }
  get lastResult(): number { return Math.min(this.page * this.pageSize, this.filteredRecords.length); }
  setPeriod(value: string): void {
    this.period = value;
    this.showCustomDates = value === 'Custom';
    if (value === 'Month') {
      this.customStart = '2026-07-01';
      this.customEnd = '2026-07-31';
    } else if (value === 'Quarter') {
      this.customStart = '2026-04-01';
      this.customEnd = '2026-06-30';
    } else if (value === 'YTD') {
      this.customStart = '2026-01-01';
      this.customEnd = '2026-07-31';
    }
    this.page = 1;
    this.notify(`${value === 'Custom' ? 'Choose a date range' : value + ' view selected'}`);
  }
  applyCustomRange(): void {
    if (!this.customStart || !this.customEnd || this.customStart > this.customEnd) {
      this.notify('Choose a valid date range');
      return;
    }
    this.page = 1;
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
  agencyFiltersChanged(): void {
    this.page = 1;
    this.rosterPage = 1;
    this.expandedPolicy = '';
    this.expandedAgentNumber = '';
  }
  rosterSearchChanged(): void { this.rosterPage = 1; this.expandedAgentNumber = ''; }
  setDashboardMode(mode: 'agent' | 'agency'): void {
    this.dashboardMode = mode;
    this.page = 1;
    this.rosterPage = 1;
    this.expandedPolicy = '';
    this.expandedAgentNumber = '';
    this.notify(`${mode === 'agency' ? 'Agency' : 'Agent'} dashboard selected`);
  }
  productionScopeChanged(): void { this.agencyFiltersChanged(); }
  goPage(next: number): void { this.page = Math.min(this.pageCount, Math.max(1, next)); }
  goRosterPage(next: number): void { this.rosterPage = Math.min(this.rosterPageCount, Math.max(1, next)); this.expandedAgentNumber = ''; }
  toggleExpanded(policy: string): void { this.expandedPolicy = this.expandedPolicy === policy ? '' : policy; }
  toggleAgentExpanded(agentNumber: string): void {
    this.expandedAgentNumber = this.expandedAgentNumber === agentNumber ? '' : agentNumber;
  }
  sortRosterBy(key: keyof AgentRosterRecord): void {
    if (this.rosterSortKey === key) this.rosterSortDirection = this.rosterSortDirection === 'asc' ? 'desc' : 'asc';
    else { this.rosterSortKey = key; this.rosterSortDirection = 'asc'; }
    this.rosterPage = 1;
  }
  trackByRosterAgent(_index: number, agent: AgentRosterRecord): string { return agent.agentNumber; }
  exportRosterCsv(): void {
    const headers = ['Agent Number', 'Agent Name', 'Upline Hierarchy', 'Contract Code', 'Commission Percentage', 'Level', 'Advance vs As-Earned'];
    const rows = this.filteredRoster.map((agent) => [
      agent.agentNumber, agent.agentName, agent.uplineHierarchy, agent.contractCode,
      agent.commissionPercentage, agent.level, agent.advanceVsAsEarned
    ]);
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    link.download = `cica-life-agent-roster-${this.productionScope}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    this.notify(`${rows.length} agent roster records exported`);
  }
  toggleActivity(): void { this.activityOpen = !this.activityOpen; }
  openActivity(): void { this.activityOpen = true; }
  refresh(): void {
    if (this.refreshing) return;
    this.refreshing = true;
    setTimeout(() => {
      this.refreshing = false;
      const updatedAt = new Date();
      const date = updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const time = updatedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      this.lastUpdated = `${date} · ${time}`;
      this.notify('Dashboard refreshed with the latest sample data');
    }, 700);
  }
  exportCsv(): void {
    const headers = ['Policy #', 'Agent ID', 'Agent Name', 'Email', 'Line of Business', 'Face Amount', 'Status', 'Client', 'Issued', 'Premium', 'Billing', 'State'];
    const rows = this.filteredRecords.map((r) => [r.policy, r.agentId, r.agent, r.email, r.line, r.amount, r.status, r.client, r.issued, r.premium, r.billing, r.state]);
    const csv = [headers, ...rows].map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    link.download = `cica-life-${this.dashboardMode}-business-register-${this.period.toLowerCase()}.csv`;
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
  formatCompactMoney(value: number): string {
    if (value >= 1_000_000) return '$' + (value / 1_000_000).toFixed(1) + 'M';
    if (value >= 1_000) return '$' + (value / 1_000).toFixed(1) + 'K';
    return '$' + Math.round(value).toLocaleString('en-US');
  }
  trackByPolicy(_index: number, row: PolicyRecord): string { return row.policy; }
}
