import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appPageEnter]',
  standalone: true
})
export class PageEnter implements OnInit {
  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    const element = this.el.nativeElement;
    element.classList.add('page-enter');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        element.classList.add('page-enter-active');
      });
    });
  }
}