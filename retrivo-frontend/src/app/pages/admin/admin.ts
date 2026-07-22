import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, signal, computed, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { forkJoin } from 'rxjs';
import { Admin as AdminService } from '../../core/services/admin';
import { Items } from '../../core/services/items';
import { Auth } from '../../core/services/auth';
import { Pagination } from '../../shared/pagination/pagination';
import { AdminStats, AdminUser, AdminItem, StatusCount, TypeCount, CategoryCount, MonthlyActivity } from '../../core/models/item.model';

Chart.register(...registerables);

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, Pagination],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Admin implements OnInit, AfterViewInit {
  @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('typeChart') typeChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('activityChart') activityChartRef!: ElementRef<HTMLCanvasElement>;

  stats = signal<AdminStats>({ totalItems: 0, pendingItems: 0, openItems: 0, resolvedItems: 0, totalUsers: 0, totalClaims: 0 });
  users = signal<AdminUser[]>([]);
  items = signal<AdminItem[]>([]);
  loading = signal<boolean>(true);
  activeTab = signal<'items' | 'users'>('items');
  itemsPage = signal<number>(1);
  usersPage = signal<number>(1);
  readonly tablePageSize = 10;

  private statusData: StatusCount[] = [];
  private typeData: TypeCount[] = [];
  private categoryData: CategoryCount[] = [];
  private activityData: MonthlyActivity[] = [];

  constructor(
    private adminService: AdminService,
    private itemsService: Items,
    public auth: Auth,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.adminService.getStats().subscribe({
      next: s => this.stats.set(s),
      error: err => console.error('getStats failed:', err.status, err.error)
    });
    this.adminService.getUsers().subscribe({
      next: u => this.users.set(u),
      error: err => console.error('getUsers failed:', err.status, err.error)
    });
    this.itemsService.getAllItemsAdmin().subscribe({
      next: i => { this.items.set(i); this.loading.set(false); },
      error: err => { console.error('getAllItemsAdmin failed:', err.status, err.error); this.loading.set(false); }
    });

    // All four chart datasets are fetched together and only rendered once every
    // one of them has arrived, so the charts no longer race each other on refresh.
    forkJoin({
      status: this.adminService.getItemsByStatus(),
      type: this.adminService.getItemsByType(),
      category: this.adminService.getItemsByCategory(),
      activity: this.adminService.getMonthlyActivity()
    }).subscribe({
      next: result => {
        this.statusData = result.status;
        this.typeData = result.type;
        this.categoryData = result.category;
        this.activityData = result.activity;
        this.tryRenderCharts();
      },
      error: err => console.error('Chart data failed:', err.status, err.error)
    });
  }

  private viewReady = false;
  ngAfterViewInit(): void {
    this.viewReady = true;
    this.tryRenderCharts();
  }

  private chartsRendered = false;
  private tryRenderCharts(): void {
    // Renders only once, and only after the view is ready AND all four
    // datasets from forkJoin have arrived (statusData/etc. are only ever
    // set together, so there's no partial-data render anymore).
    if (!this.viewReady || this.chartsRendered) return;
    if (!this.statusData.length && !this.typeData.length && !this.categoryData.length && !this.activityData.length) return;
    this.chartsRendered = true;

    new Chart(this.statusChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.statusData.map(d => d.status),
        datasets: [{ data: this.statusData.map(d => d.count), backgroundColor: ['#06B6D4', '#F59E0B', '#10B981'] }]
      },
      options: { plugins: { legend: { labels: { color: '#8B8D93' } } } }
    });

    new Chart(this.typeChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.typeData.map(d => d.type),
        datasets: [{ data: this.typeData.map(d => d.count), backgroundColor: ['#F43F5E', '#10B981'] }]
      },
      options: { plugins: { legend: { labels: { color: '#8B8D93' } } } }
    });

    new Chart(this.categoryChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: this.categoryData.map(d => d.category),
        datasets: [{ data: this.categoryData.map(d => d.count), backgroundColor: '#8B5CF6' }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#8B8D93' }, grid: { color: '#1F2937' } },
          y: { ticks: { color: '#8B8D93' }, grid: { color: '#1F2937' } }
        }
      }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    new Chart(this.activityChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: this.activityData.map(d => `${monthNames[d.month - 1]} ${d.year}`),
        datasets: [{ data: this.activityData.map(d => d.count), borderColor: '#06B6D4', backgroundColor: 'rgba(6,182,212,0.1)', fill: true, tension: 0.3 }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#8B8D93' }, grid: { color: '#1F2937' } },
          y: { ticks: { color: '#8B8D93' }, grid: { color: '#1F2937' } }
        }
      }
    });
  }

  deleteItem(id: number): void {
    if (!confirm('Delete this item permanently? This cannot be undone.')) return;
    this.itemsService.deleteItem(id).subscribe({
      next: () => this.items.set(this.items().filter(i => i.id !== id)),
      error: () => alert('Failed to delete item.')
    });
  }

  logout(): void {
    this.auth.logout();
  }

  statusClasses(status: string): string {
    switch (status) {
      case 'Open': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'Pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Resolved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  }

  pagedItems = computed(() => {
    const start = (this.itemsPage() - 1) * this.tablePageSize;
    return this.items().slice(start, start + this.tablePageSize);
  });

  pagedUsers = computed(() => {
    const start = (this.usersPage() - 1) * this.tablePageSize;
    return this.users().slice(start, start + this.tablePageSize);
  });
}