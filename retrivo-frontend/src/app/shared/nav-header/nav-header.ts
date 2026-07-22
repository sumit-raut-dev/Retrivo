import { Component, CUSTOM_ELEMENTS_SCHEMA , signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-nav-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './nav-header.html',
  styleUrl: './nav-header.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NavHeader {
  searchQuery = '';

  constructor(public auth: Auth, private router: Router) { }

  onSearch(): void {
    const query = this.searchQuery.trim();
    this.router.navigate(['/browse'], query ? { queryParams: { search: query } } : {});
  }

  logout(): void {
    this.auth.logout();
  }

  mobileMenuOpen = signal<boolean>(false);

  toggleMobileMenu(): void {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}