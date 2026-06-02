import { MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';

export const matDialogConfig: MatDialogConfig = {
  minWidth: '40%',
  maxWidth: '100%',
  position: {
    top: '10vh',
  },
};

export const resetApp = (router: Router) => {
  localStorage.removeItem('_nt');
  localStorage.removeItem('_ta');
  localStorage.removeItem('_ur');
  localStorage.removeItem('_ud');
  localStorage.removeItem('_e');
  router.navigateByUrl('/login');
};
