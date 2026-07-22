import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

declare const google: any;

@Injectable({ providedIn: 'root' })
export class GoogleAuth {
  private initialized = false;
  credentialReceived = new Subject<string>();

  constructor(private zone: NgZone) { }

  private ensureInit(): boolean {
    if (typeof google === 'undefined') return false;

    if (!this.initialized) {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => {
          this.zone.run(() => this.credentialReceived.next(response.credential));
        }
      });
      this.initialized = true;
    }
    return true;
  }

  renderButton(target: HTMLElement, attempt = 0): void {
    const ready = this.ensureInit();

    if (!ready) {
      if (attempt < 20) setTimeout(() => this.renderButton(target, attempt + 1), 100);
      return;
    }

    target.innerHTML = '';
    const width = Math.min(360, target.offsetWidth || 360);
    google.accounts.id.renderButton(target, { theme: 'outline', size: 'large', width });
  }
}