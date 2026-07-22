import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appCountUp]',
  standalone: true
})
export class CountUp implements OnInit {
  @Input('appCountUp') target = 0;
  @Input() suffix = '';

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    const element = this.el.nativeElement;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animate(element);
          observer.unobserve(element);
        }
      });
    }, { threshold: 0.3 });
    observer.observe(element);
  }

  private animate(element: HTMLElement): void {
    const duration = 1200;
    const start = performance.now();
    const target = this.target;

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);
      element.textContent = `${value}${this.suffix}`;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}