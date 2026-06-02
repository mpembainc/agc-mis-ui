import { Component, inject, Input } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() title: string = '';
  @Input() subTitle?: string;
  @Input() noMargin: boolean = false;
  @Input() canGoBack: boolean = false;

  private location = inject(Location);

  goBack() {
    this.location.back();
  }
}
