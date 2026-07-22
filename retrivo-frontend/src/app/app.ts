import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { routeAnimations } from './core/animations/route-animations';
import { NavHeader } from './shared/nav-header/nav-header';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavHeader, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  animations: [routeAnimations]
})
export class App {
  title = 'retrivo-frontend';

  private hiddenNavRoutes = ['/login', '/register', '/admin-login', '/admin'];

  hideNav = signal(false);

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.hideNav.set(this.hiddenNavRoutes.some(route => e.urlAfterRedirects.startsWith(route)));
      });
  }

  getAnimationState(outlet: RouterOutlet): string {
    if (!outlet?.isActivated) return '';
    const path = outlet.activatedRoute.routeConfig?.path ?? '';
    const query = outlet.activatedRoute.snapshot.queryParams;
    return path + JSON.stringify(query);
  }
}