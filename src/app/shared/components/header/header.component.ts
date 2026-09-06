import { Component, inject, Input } from '@angular/core';
import { Location } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { LucideArrowLeft } from '@lucide/angular';

@Component({
  selector: 'app-header',
  imports: [ButtonComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() title: string = '';
  @Input() subTitle?: string;
  @Input() noMargin: boolean = false;
  @Input() canGoBack: boolean = false;
  @Input() backPosition: 'start' | 'end' = 'start';

  protected readonly arrowLeftIcon = LucideArrowLeft;
  private location = inject(Location);

  goBack() {
    this.location.back();
  }
}
