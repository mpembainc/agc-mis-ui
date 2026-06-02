import { Directive, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appScrollTracker]',
  standalone: true,
})
export class ScrollTrackerDirective {
  @Output() scrollEnd = new EventEmitter<void>();

  constructor(private el: ElementRef) { }

  @HostListener('scroll', ['$event'])
  onScroll(event: any) {
    const element = event.target;

    const atBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 20;

    if (atBottom) {
      this.scrollEnd.emit();
    }
  }
}