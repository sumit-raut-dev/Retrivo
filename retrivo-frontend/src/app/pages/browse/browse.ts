import { Component, OnInit, signal, computed, CUSTOM_ELEMENTS_SCHEMA, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Items } from '../../core/services/items';
import { Categories } from '../../core/services/categories';
import { Item, Category } from '../../core/models/item.model';
import { PageEnter } from '../../core/directives/page-enter';
import { AppFooter } from '../../shared/app-footer/app-footer';
import { Pagination } from '../../shared/pagination/pagination';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PageEnter, AppFooter, Pagination],
  templateUrl: './browse.html',
  styleUrl: './browse.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Browse implements OnInit {
  items = signal<Item[]>([]);
  categories = signal<Category[]>([]);
  loading = signal<boolean>(true);
  currentPage = signal<number>(1);
  pageSize = 9;

  searchQuery = '';
  selectedCategoryId: number | null = null;
  selectedItemType: string | null = null;

  constructor(
    private itemsService: Items,
    private categoriesService: Categories,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';
      this.fetchItems();
    });

    this.categoriesService.getCategories().subscribe({
      next: cats => this.categories.set(cats),
      error: err => console.error('Failed to load categories', err)
    });
  }

  fetchItems(): void {
    this.loading.set(true);
    this.itemsService.getItems({
      categoryId: this.selectedCategoryId ?? undefined,
      itemType: this.selectedItemType ?? undefined,
      search: this.searchQuery || undefined
    }).subscribe({
      next: items => {
        this.items.set(items);
        this.currentPage.set(1);
        this.loading.set(false);
      },
      error: err => {
        console.error('Failed to load items', err);
        this.loading.set(false);
      }
    });
  }

  onSearch(): void {
    this.fetchItems();
  }

  onFilterChange(): void {
    this.fetchItems();
  }

  statusClasses(status: string): string {
    switch (status) {
      case 'Open': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Resolved': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  }

  statusIcon(status: string): string {
    switch (status) {
      case 'Open': return 'lucide:circle-check';
      case 'Pending': return 'lucide:clock';
      case 'Resolved': return 'lucide:circle-check';
      default: return 'lucide:circle';
    }
  }

  pagedItems = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.items().slice(start, start + this.pageSize);
  });

  categoryDropdownOpen = signal<boolean>(false);

  get selectedCategoryName(): string {
    const cat = this.categories().find(c => c.id === this.selectedCategoryId);
    return cat ? cat.name : 'All categories';
  }

  toggleCategoryDropdown(): void {
    this.categoryDropdownOpen.set(!this.categoryDropdownOpen());
  }

  selectCategoryFilter(catId: number | null): void {
    this.selectedCategoryId = catId;
    this.categoryDropdownOpen.set(false);
    this.onFilterChange();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.category-dropdown-wrapper')) {
      this.categoryDropdownOpen.set(false);
    }
  }
}