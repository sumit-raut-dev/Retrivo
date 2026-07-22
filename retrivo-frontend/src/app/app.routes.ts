import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Browse } from './pages/browse/browse';
import { ItemDetail } from './pages/item-detail/item-detail';
import { ReportItem } from './pages/report-item/report-item';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { AdminLogin } from './pages/admin-login/admin-login';
import { Admin } from './pages/admin/admin';
import { authGuard } from './core/guards/auth-guard';
import { Profile } from './pages/profile/profile';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'browse', component: Browse },
  { path: 'items/:id', component: ItemDetail },
  { path: 'report-item', component: ReportItem },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'admin-login', component: AdminLogin },
  { path: 'admin', component: Admin, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];