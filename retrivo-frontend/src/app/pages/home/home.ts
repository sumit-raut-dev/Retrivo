import { Component, OnInit, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Items } from '../../core/services/items';
import { Item, PublicStats } from '../../core/models/item.model';
import { ScrollReveal } from '../../core/directives/scroll-reveal';
import { CountUp } from '../../core/directives/count-up';
import { AppFooter } from '../../shared/app-footer/app-footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ScrollReveal, CountUp,AppFooter],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Home implements OnInit {
  recentItems = signal<Item[]>([]);
  stats = signal<PublicStats>({ totalItems: 0, resolvedItems: 0, activeUsers: 0, avgRecoveryHours: 0 });
  searchQuery = '';

  constructor(private itemsService: Items, private router: Router) {}

  ngOnInit(): void {
    this.itemsService.getItems().subscribe({
      next: items => this.recentItems.set(items.slice(0, 3)),
      error: err => console.error('Failed to load items', err)
    });

    this.itemsService.getPublicStats().subscribe({
      next: s => this.stats.set(s),
      error: err => console.error('Failed to load stats', err)
    });
  }

  onSearch(): void {
    const query = this.searchQuery.trim();
    this.router.navigate(['/browse'], query ? { queryParams: { search: query } } : {});
  }

  statusClasses(status: string): string {
    switch (status) {
      case 'Open': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'Pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Resolved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  }

  statusIcon(status: string): string {
    switch (status) {
      case 'Open': return 'lucide:circle';
      case 'Pending': return 'lucide:clock';
      case 'Resolved': return 'lucide:circle-check';
      default: return 'lucide:circle';
    }
  }
}