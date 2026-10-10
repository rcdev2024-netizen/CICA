import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, HostListener, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonApp, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { ClickSpinnerDirective } from './click-spinner.directive';
import {
  alertCircleOutline, arrowDownOutline, arrowUpOutline, calendarOutline, checkmarkCircleOutline, checkmarkOutline,
  chevronBackOutline, chevronDownOutline, chevronForwardOutline, closeOutline, cloudUploadOutline,
  documentTextOutline, downloadOutline, ellipsisHorizontal, filterOutline, menuOutline,
  notificationsOutline, pauseCircleOutline, peopleOutline, refreshOutline, searchOutline,
  shieldCheckmarkOutline, timeOutline, trendingUpOutline, walletOutline,
  arrowForwardOutline, helpCircleOutline, moonOutline, sunnyOutline
} from 'ionicons/icons';
import { AgentRosterRecord, MockDataService, PolicyRecord } from './mock-data.service';

interface DashboardTourStep {
  target: string;
  title: string;
  description: string;
  mode?: 'agent' | 'agency';
}

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
export class AppComponent implements AfterViewInit, OnDestroy {
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
  darkMode = false;
  profileMenuOpen = false;
  tourWelcomeOpen = false;
  tourActive = false;
  tourSteps: DashboardTourStep[] = [];
  tourStepIndex = 0;
  viewportWidth = 0;
  viewportHeight = 0;
  tourSpotlight = { left: 0, top: 0, width: 0, height: 0 };
  tourPopover = { left: 0, top: 0 };
  lastUpdated = 'Jul 31, 2026 · 10:24 AM';
  toast = '';
  private toastTimer?: ReturnType<typeof setTimeout>;
  private tourStartupTimer?: ReturnType<typeof setTimeout>;
  private tourInitialActivityOpen = false;
  private tourInitialDashboardMode: 'agent' | 'agency' = 'agent';
  private tourInitialPeriod = 'YTD';
  private tourInitialCustomDates = false;
  private tourPreviewingCustomRange = false;
  private tourLayoutFrame = 0;
  private tourStepTimer?: ReturnType<typeof setTimeout>;
  private readonly tourStorageKey = 'cica-dashboard-tour-v1:Gina Graber';
  private readonly onTourResize = (): void => this.queueTourLayout();
  private readonly onTourScroll = (): void => this.queueTourLayout();

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
    this.darkMode = this.readDarkModePreference();
    addIcons({
      alertCircleOutline, arrowDownOutline, arrowUpOutline, calendarOutline, checkmarkCircleOutline,
      chevronBackOutline, chevronDownOutline, chevronForwardOutline, closeOutline, cloudUploadOutline,
      documentTextOutline, downloadOutline, ellipsisHorizontal, filterOutline, menuOutline,
      notificationsOutline, pauseCircleOutline, peopleOutline, refreshOutline, searchOutline,
      shieldCheckmarkOutline, timeOutline, trendingUpOutline, walletOutline,
      arrowForwardOutline, helpCircleOutline, checkmarkOutline, moonOutline, sunnyOutline
    });
  }

  ngAfterViewInit(): void {
    window.addEventListener('resize', this.onTourResize);
    document.addEventListener('scroll', this.onTourScroll, true);
    this.tourStartupTimer = setTimeout(() => {
      if (this.dashboardMode === 'agent' && !this.readTourStatus()) {
        this.tourWelcomeOpen = true;
        requestAnimationFrame(() => document.querySelector<HTMLElement>('[data-tour-focus]')?.focus());
      }
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onTourResize);
    document.removeEventListener('scroll', this.onTourScroll, true);
    if (this.tourLayoutFrame) cancelAnimationFrame(this.tourLayoutFrame);
    clearTimeout(this.tourStepTimer);
    clearTimeout(this.tourStartupTimer);
    clearTimeout(this.toastTimer);
  }

  get currentTourStep(): DashboardTourStep | undefined { return this.tourSteps[this.tourStepIndex]; }

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
  toggleProfileMenu(): void { this.profileMenuOpen = !this.profileMenuOpen; }
  toggleDarkMode(): void {
    const previousMode = this.darkMode;
    this.darkMode = !previousMode;
    try {
      window.localStorage.setItem('cica-dashboard-theme', this.darkMode ? 'dark' : 'light');
    } catch (error) {
      this.darkMode = previousMode;
      console.error('Could not save dashboard theme preference.', error);
      this.notify('Your theme preference could not be saved.');
    }
  }
  beginTour(): void {
    this.tourWelcomeOpen = false;
    this.tourInitialActivityOpen = this.activityOpen;
    this.tourInitialDashboardMode = this.dashboardMode;
    this.tourInitialPeriod = this.period;
    this.tourInitialCustomDates = this.showCustomDates;
    this.tourSteps = this.createTourSteps();
    this.tourActive = true;
    this.tourStepIndex = 0;
    this.saveTourStatus('started');
    this.presentTourStep(0, 1);
  }
  startTour(): void {
    this.profileMenuOpen = false;
    this.beginTour();
  }
  nextTourStep(): void {
    if (this.tourStepIndex >= this.tourSteps.length - 1) {
      this.finishTour();
      return;
    }
    this.presentTourStep(this.tourStepIndex + 1, 1);
  }
  previousTourStep(): void {
    if (this.tourStepIndex > 0) this.presentTourStep(this.tourStepIndex - 1, -1);
  }
  skipTour(): void { this.closeTour('dismissed'); }
  finishTour(): void { this.closeTour('completed'); }

  @HostListener('document:keydown.escape', ['$event'])
  closeTourOnEscape(event: KeyboardEvent): void {
    if (!this.tourActive && !this.tourWelcomeOpen) return;
    event.preventDefault();
    this.skipTour();
  }

  @HostListener('document:click', ['$event'])
  closeProfileMenuOnOutsideClick(event: MouseEvent): void {
    if (!this.profileMenuOpen) return;
    const target = event.target;
    if (target instanceof Element && !target.closest('[data-profile-menu-surface]')) {
      this.profileMenuOpen = false;
    }
  }

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

  private createTourSteps(): DashboardTourStep[] {
    const steps: DashboardTourStep[] = [
      {
        target: 'date-range',
        title: 'Reporting dates',
        description: 'This display shows the date range behind the dashboard view. Choose a period below to update it; Custom reveals fields for specific start and end dates.',
        mode: 'agent'
      },
      {
        target: 'period-filters',
        title: 'Choose a reporting period',
        description: 'Month, Quarter, and YTD set a preset range. Custom reveals date fields and Apply range. Compare periods to review the dashboard in the timeframe you need.',
        mode: 'agent'
      },
      {
        target: 'custom-range',
        title: 'Set custom dates',
        description: 'The date fields let you enter a start and end date. Apply range validates the dates and updates the displayed reporting period.',
        mode: 'agent'
      },
      {
        target: 'dashboard-mode',
        title: 'Switch dashboard views',
        description: 'Use this Agent / Agency selector in the profile menu to switch reporting views. The walkthrough covers each view; in a connected account, your available choice depends on your access.',
        mode: 'agent'
      },
      {
        target: 'refresh',
        title: 'Refresh the dashboard',
        description: 'Refresh runs the dashboard’s sample refresh action and updates the Last updated timestamp. This demo does not fetch data from a live service.',
        mode: 'agent'
      },
      ...this.kpis.map((kpi, index) => ({
        target: `kpi-${index}`,
        title: kpi.title,
        description: `This card shows the dashboard’s sample ${kpi.title.toLowerCase()} figure. The demo values are illustrative and are not recalculated from policy records when you change the reporting period.`,
        mode: 'agent' as const
      })),
      {
        target: 'business-mix',
        title: 'Sales and business mix',
        description: 'This chart compares displayed sales share across product lines. The percentages and amounts give a quick view of the mix; the panel labels the figures YTD and uses sample data.',
        mode: 'agent'
      },
      {
        target: 'persistence',
        title: 'Policy persistence',
        description: 'Each ring shows the displayed retention percentage at a policy-age milestone from 1 to 18 months. The overall figure below is the average of those five sample percentages.',
        mode: 'agent'
      },
      {
        target: 'growth-trend',
        title: 'Issued and submitted trend',
        description: 'Compare the issued and submitted series across the months shown on the horizontal axis. The vertical labels provide the chart’s scale; use the lines to compare direction over time.',
        mode: 'agent'
      },
      ...this.monthly.map((item, index) => ({
        target: `operational-${index}`,
        title: item.title,
        description: `This card summarizes ${item.title.toLowerCase()} and shows a short monthly activity chart. Use the month labels and bar heights to compare the displayed sample values; View details currently shows a contextual message.`,
        mode: 'agent' as const
      })),
      {
        target: 'business-register',
        title: 'Business register',
        description: 'Search the displayed policy records, sort columns, expand a record for more fields, and export the current results as a CSV. On smaller screens, tap a policy row to expand it.',
        mode: 'agent'
      },
      {
        target: 'agency-filters',
        title: 'Filter agency production',
        description: 'Choose overall, agency, or agent production, then search by agent name. The KPIs, agency trend cards, and roster update to reflect the selected view.',
        mode: 'agency'
      },
      {
        target: 'kpi-0',
        title: 'Policies in period',
        description: 'This is the count of policy records matching the current production view and reporting dates. Search or filter the Business register to inspect the records behind the sample count.',
        mode: 'agency'
      },
      {
        target: 'kpi-1',
        title: 'Face amount',
        description: 'This total adds the face amount values on policy records matching the current production view and reporting dates. It is calculated from the demo records.',
        mode: 'agency'
      },
      {
        target: 'kpi-2',
        title: 'Producing agents',
        description: 'This count reflects unique agents with matching records whose status is Active or Submitted in this dashboard’s sample data.',
        mode: 'agency'
      },
      {
        target: 'kpi-3',
        title: 'Estimated commissions',
        description: 'This estimate sums matching record premiums using each agent’s displayed roster commission percentage. It is sample data, not a live commission statement.',
        mode: 'agency'
      },
      ...this.agencyMonthlyCards.map((item, index) => ({
        target: `agency-trend-${index}`,
        title: item.title,
        description: `This card shows the ${item.title.toLowerCase()} summary and monthly bars for the selected production view. Review the month labels and values to compare the displayed sample trend.`,
        mode: 'agency' as const
      })),
      {
        target: 'agent-data',
        title: 'Agent data',
        description: 'These bars compare roster size, producing agents, and downlines for the selected production view. Bar length is scaled against the largest count in this card.',
        mode: 'agency'
      },
      {
        target: 'agent-roster',
        title: 'Agent roster',
        description: 'Search and sort the roster, expand an agent to review the displayed appointment details, and export roster rows as a CSV. The roster is shown in the agency view.',
        mode: 'agency'
      },
      {
        target: 'business-register',
        title: 'Agency business register',
        description: 'This register shows policy records for the selected agency production view. Search, sort, expand records, or export the current results as a CSV.',
        mode: 'agency'
      },
      {
        target: 'view-details',
        title: 'View details actions',
        description: 'These links are repeated across dashboard cards. In this sample dashboard they show a short contextual message; they do not open a separate report or page.',
        mode: 'agent'
      },
      {
        target: 'widget-actions',
        title: 'Widget action menu',
        description: 'The ellipsis on a KPI card shows a short message about that metric and the selected period. It is a demo action, not a full settings menu.',
        mode: 'agent'
      },
      {
        target: 'notification-bell',
        title: 'Notifications and activity',
        description: 'Select the bell to open the Recent activity drawer, where the dashboard lists sample policy and application events.',
        mode: 'agent'
      },
      {
        target: 'recent-activity',
        title: 'Recent activity',
        description: 'Review the listed sample policy, application, hold, and billing events. Close the drawer with its X; View all activity currently displays a demo message.',
        mode: 'agent'
      },
      {
        target: 'profile-theme-mode',
        title: 'Dark and light themes',
        description: 'This profile-menu option switches between dark and light appearance. Your selection is remembered in this browser.',
        mode: 'agent'
      },
      {
        target: 'profile-menu',
        title: 'Profile options and replay',
        description: 'This menu shows the signed-in demo profile, the Agent / Agency view selector, the appearance setting, and Take a Tour to replay the walkthrough.',
        mode: 'agent'
      }
    ];
    return steps;
  }

  private presentTourStep(index: number, direction: 1 | -1): void {
    if (!this.tourActive) return;
    if (index < 0 || index >= this.tourSteps.length) {
      this.closeTour('dismissed');
      this.notify('The remaining tour items are not available in this dashboard view.');
      return;
    }

    const step = this.tourSteps[index];
    if (step.target === 'custom-range') {
      this.period = 'Custom';
      this.showCustomDates = true;
      this.tourPreviewingCustomRange = true;
    } else if (this.tourPreviewingCustomRange) {
      this.period = this.tourInitialPeriod;
      this.showCustomDates = this.tourInitialCustomDates;
      this.tourPreviewingCustomRange = false;
    }
    if (step.mode && this.dashboardMode !== step.mode) this.dashboardMode = step.mode;
    this.tourStepIndex = index;
    this.profileMenuOpen = ['dashboard-mode', 'profile-theme-mode', 'profile-menu'].includes(step.target);
    this.activityOpen = this.tourInitialActivityOpen || step.target === 'recent-activity';
    clearTimeout(this.tourStepTimer);
    const locateTarget = (): void => {
      if (!this.tourActive) return;
      const target = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
      if (!target || !target.isConnected || target.getClientRects().length === 0) {
        this.presentTourStep(index + direction, direction);
        return;
      }
      target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      this.queueTourLayout();
    };
    if (step.target === 'recent-activity') {
      this.tourStepTimer = setTimeout(() => requestAnimationFrame(locateTarget), 280);
    } else {
      requestAnimationFrame(locateTarget);
    }
  }

  private queueTourLayout(): void {
    if (!this.tourActive || this.tourLayoutFrame) return;
    this.tourLayoutFrame = requestAnimationFrame(() => {
      this.tourLayoutFrame = 0;
      this.updateTourLayout();
    });
  }

  private updateTourLayout(): void {
    if (!this.tourActive || !this.currentTourStep) return;
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;
    const target = document.querySelector<HTMLElement>(`[data-tour="${this.currentTourStep.target}"]`);
    if (!target || !target.isConnected || target.getClientRects().length === 0) {
      this.presentTourStep(this.tourStepIndex + 1, 1);
      return;
    }

    const rect = target.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      this.presentTourStep(this.tourStepIndex + 1, 1);
      return;
    }
    const padding = 7;
    const left = Math.max(4, rect.left - padding);
    const top = Math.max(4, rect.top - padding);
    this.tourSpotlight = {
      left,
      top,
      width: Math.min(window.innerWidth - left - 4, rect.width + padding * 2),
      height: Math.min(window.innerHeight - top - 4, rect.height + padding * 2)
    };

    const popover = document.querySelector<HTMLElement>('.tour-popover');
    const popoverWidth = popover?.offsetWidth || Math.min(360, window.innerWidth - 32);
    const popoverHeight = popover?.offsetHeight || 240;
    const gap = 17;
    const belowSpace = window.innerHeight - rect.bottom - gap;
    const aboveSpace = rect.top - gap;
    const placeBelow = belowSpace >= popoverHeight || belowSpace >= aboveSpace;
    const preferredTop = placeBelow ? rect.bottom + gap : rect.top - popoverHeight - gap;
    const preferredLeft = rect.left + rect.width / 2 - popoverWidth / 2;
    this.tourPopover = {
      left: Math.max(12, Math.min(window.innerWidth - popoverWidth - 12, preferredLeft)),
      top: Math.max(12, Math.min(window.innerHeight - popoverHeight - 12, preferredTop))
    };
  }

  private closeTour(status: 'completed' | 'dismissed'): void {
    if (!this.tourActive && !this.tourWelcomeOpen) return;
    this.saveTourStatus(status);
    this.tourActive = false;
    this.tourWelcomeOpen = false;
    this.profileMenuOpen = false;
    this.activityOpen = this.tourInitialActivityOpen;
    this.dashboardMode = this.tourInitialDashboardMode;
    this.period = this.tourInitialPeriod;
    this.showCustomDates = this.tourInitialCustomDates;
    this.tourPreviewingCustomRange = false;
    this.tourSteps = [];
    this.tourStepIndex = 0;
    clearTimeout(this.tourStepTimer);
    if (this.tourLayoutFrame) {
      cancelAnimationFrame(this.tourLayoutFrame);
      this.tourLayoutFrame = 0;
    }
    requestAnimationFrame(() => document.querySelector<HTMLElement>('[data-tour="profile-button"]')?.focus());
  }

  private readTourStatus(): 'started' | 'completed' | 'dismissed' | null {
    try {
      const status = window.localStorage.getItem(this.tourStorageKey);
      return status === 'started' || status === 'completed' || status === 'dismissed' ? status : null;
    } catch (error) {
      console.error('Could not read dashboard tour preference.', error);
      this.notify('Tour preference could not be read. You can still take the tour from your profile menu.');
      return null;
    }
  }

  private saveTourStatus(status: 'started' | 'completed' | 'dismissed'): void {
    try {
      window.localStorage.setItem(this.tourStorageKey, status);
    } catch (error) {
      console.error('Could not save dashboard tour preference.', error);
      this.notify('Tour progress could not be saved. You can replay the tour from your profile menu.');
    }
  }

  private readDarkModePreference(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem('cica-dashboard-theme') === 'dark';
    } catch (error) {
      console.error('Could not read dashboard theme preference.', error);
      return false;
    }
  }
}
