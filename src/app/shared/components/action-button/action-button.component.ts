import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogConfig } from '@angular/material/dialog';
import { matDialogConfig } from '../../config';

@Component({
  selector: 'app-action-button',
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './action-button.component.html',
})
export class ActionButtonComponent {
  private router = inject(Router);
  private dialog = inject(MatDialog);

  @Input() label: string = 'Add';
  @Input() icon: string = 'add';
  @Input() color: string = 'primary';
  @Input() buttonClass: string = 'text-[13px]! font-figtree! rounded-lg! h-9! px-4! hover:scale-103! transition-all! duration-300!';

  // Navigation mode
  @Input() routerLink?: string | any[];

  // Dialog mode
  @Input() dialogComponent?: any;
  @Input() dialogData?: any;
  @Input() dialogConfig?: MatDialogConfig;

  // Manual callback option
  @Output() actionClick = new EventEmitter<MouseEvent>();
  @Output() dialogClosed = new EventEmitter<any>();

  handleClick(event: MouseEvent): void {
    if (this.dialogComponent) {
      this.openDialog();
    } else if (!this.routerLink) {
      this.actionClick.emit(event);
    }
  }

  private openDialog(): void {
    const config: MatDialogConfig = {
      ...matDialogConfig,
      ...this.dialogConfig,
      data: this.dialogData || this.dialogConfig?.data
    };

    const dialogRef = this.dialog.open(this.dialogComponent, config);

    dialogRef.afterClosed().subscribe((result) => {
      this.dialogClosed.emit(result);
    });
  }
}
