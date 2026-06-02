import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatAnchor, MatButton } from "@angular/material/button";
import { ConfirmTooltipComponent } from '../confirm-tooltip/confirm-tooltip.component';

@Component({
  selector: 'app-dialog-layout',
  imports: [CommonModule, MatDialogModule, MatAnchor, MatButton, ConfirmTooltipComponent],
  templateUrl: './dialog-layout.component.html',
})
export class DialogLayoutComponent {
  @Input({ required: true }) title!: string;
  @Input() showPrimaryButton = true;
  @Input() useConfirmTooltip = false;
  @Input() primaryButtonLabel = 'Save';
  @Input() cancelButtonLabel = 'Cancel';
  @Input() confirmTooltipTitle = 'Confirm';
  @Input() confirmTooltipMessage = 'Are you sure you want to continue?';
  @Input() confirmTooltipButtonLabel = 'Yes';
  @Input() confirmTooltipCancelLabel = 'No';
  @Input() disableCancelButton = false;
  @Input() disablePrimaryButton = false;

  @Output() onConfirmed = new EventEmitter<void>();
}
