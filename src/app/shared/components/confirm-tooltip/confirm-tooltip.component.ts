import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { animate, style, transition, trigger } from '@angular/animations';
import { Subject, Subscription } from 'rxjs';
import { twMerge } from 'tailwind-merge';

@Component({
  selector: 'app-confirm-tooltip',
  imports: [CommonModule, MatButtonModule],
  templateUrl: './confirm-tooltip.component.html',
  animations: [
    trigger('tooltipAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95) translateY(4px)' }),
        animate('150ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ]),
      transition(':leave', [
        animate('100ms cubic-bezier(0.4, 0, 1, 1)', style({ opacity: 0, transform: 'scale(0.95) translateY(4px)' }))
      ])
    ])
  ]
})
export class ConfirmTooltipComponent implements OnInit, OnDestroy {
  @Input() buttonLabel = 'Save';
  @Input() confirmTitle = 'Confirm';
  @Input() confirmMessage = 'Are you sure you want to continue?';
  @Input() confirmButtonLabel = 'Yes';
  @Input() cancelButtonLabel = 'No';
  @Input() disabled = false;
  @Input() buttonClasses = '';
  @Input() materialButton = true;

  @Output() confirmed = new EventEmitter<void>();

  isOpen = false;

  private static readonly active$ = new Subject<ConfirmTooltipComponent>();
  private sub!: Subscription;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  ngOnInit() {
    this.sub = ConfirmTooltipComponent.active$.subscribe(active => {
      if (active !== this) this.isOpen = false;
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  get actionButtonClasses() {
    return twMerge('px-4 py-1.5 text-[12px] rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2');
  }

  get confirmButtonClasses() {
    return twMerge(this.actionButtonClasses, 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500');
  }

  get cancelButtonClasses() {
    return twMerge(this.actionButtonClasses, 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-300');
  }

  togglePopover(event: MouseEvent) {
    event.stopPropagation();
    if (this.disabled) {
      return;
    }
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      ConfirmTooltipComponent.active$.next(this);
    }
  }

  cancel(event?: MouseEvent) {
    event?.stopPropagation();
    this.isOpen = false;
  }

  confirm(event: MouseEvent) {
    event.stopPropagation();
    this.isOpen = false;
    this.confirmed.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.isOpen) {
      return;
    }

    const targetNode = event.target as Node | null;
    if (targetNode && !this.elementRef.nativeElement.contains(targetNode)) {
      this.isOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.isOpen = false;
  }
}
