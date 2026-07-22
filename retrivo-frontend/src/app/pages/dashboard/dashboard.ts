import { Component, OnInit, signal, computed, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Items } from '../../core/services/items';
import { Claims } from '../../core/services/claims';
import { MyItem, ItemClaim } from '../../core/models/item.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Dashboard implements OnInit {
  myItems = signal<MyItem[]>([]);
  loading = signal<boolean>(true);
  activeFilter = signal<'All' | 'Open' | 'Pending' | 'Resolved'>('All');

  selectedItem = signal<MyItem | null>(null);
  claims = signal<ItemClaim[]>([]);
  claimsLoading = signal<boolean>(false);

  filteredItems = computed(() => {
    const filter = this.activeFilter();
    const items = this.myItems();
    return filter === 'All' ? items : items.filter(i => i.status === filter);
  });

  stats = computed(() => {
    const items = this.myItems();
    return {
      total: items.length,
      open: items.filter(i => i.status === 'Open').length,
      pending: items.filter(i => i.status === 'Pending').length,
      resolved: items.filter(i => i.status === 'Resolved').length
    };
  });

  constructor(private itemsService: Items, private claimsService: Claims) {}

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading.set(true);
    this.itemsService.getMyItems().subscribe({
      next: items => {
        this.myItems.set(items);
        this.loading.set(false);
        if (items.length > 0 && !this.selectedItem()) {
          this.selectItem(items[0]);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  selectItem(item: MyItem): void {
    this.selectedItem.set(item);
    this.claimsLoading.set(true);
    this.claimsService.getClaimsForItem(item.id).subscribe({
      next: claims => {
        this.claims.set(claims);
        this.claimsLoading.set(false);
      },
      error: () => this.claimsLoading.set(false)
    });
  }

  resolveItem(item: MyItem, event: Event): void {
    event.stopPropagation();
    this.itemsService.resolveItem(item.id).subscribe({
      next: () => this.updateItemStatus(item.id, 'Resolved'),
      error: () => alert('Failed to mark item as resolved.')
    });
  }

  reopenItem(item: MyItem, event: Event): void {
    event.stopPropagation();
    this.itemsService.reopenItem(item.id).subscribe({
      next: () => this.updateItemStatus(item.id, 'Open'),
      error: () => alert('Failed to reopen item.')
    });
  }

  private updateItemStatus(id: number, status: string): void {
    this.myItems.set(this.myItems().map(i => i.id === id ? { ...i, status } : i));
    if (this.selectedItem()?.id === id) {
      this.selectedItem.set({ ...this.selectedItem()!, status });
    }
  }

  statusClasses(status: string): string {
    switch (status) {
      case 'Open': return 'text-cyan-400';
      case 'Pending': return 'text-amber-400';
      case 'Resolved': return 'text-emerald-400';
      default: return 'text-muted-foreground';
    }
  }

  statusIcon(status: string): string {
    switch (status) {
      case 'Open': return 'lucide:circle-alert';
      case 'Pending': return 'lucide:clock';
      case 'Resolved': return 'lucide:circle-check';
      default: return 'lucide:circle';
    }
  }
}