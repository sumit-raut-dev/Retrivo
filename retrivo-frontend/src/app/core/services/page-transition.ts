import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PageTransition {
  x = 50;
  y = 50;
  state = signal<'idle' | 'expand' | 'fade'>('idle');

  private lastX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
  private lastY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;

  recordClick(clientX: number, clientY: number): void {
    this.lastX = clientX;
    this.lastY = clientY;
  }

  trigger(): void {
    this.x = (this.lastX / window.innerWidth) * 100;
    this.y = (this.lastY / window.innerHeight) * 100;
    this.state.set('expand');
    setTimeout(() => this.state.set('fade'), 400);
    setTimeout(() => this.state.set('idle'), 750);
  }
}