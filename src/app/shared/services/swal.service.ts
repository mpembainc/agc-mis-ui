import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class SwalService {
  async confirm(message: string, title = 'Warning', confirmBtn = 'Yes!') {
    return await Swal.fire({
      title: title,
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmBtn,
      customClass: {
        popup: 'small-swal',
      },
    });
  }

  async confirmWithInput(
    message: string,
    inputLabel: string,
    title = 'Input Required'
  ) {
    const result = await Swal.fire({
      title: title,
      text: message,
      input: 'text',
      inputLabel: inputLabel,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Submit',
      customClass: {
        popup: 'small-swal',
      }
    });
    return result;
  }

  async error(message: string) {
    const result = await Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: message,
      customClass: {
        popup: 'small-swal',
      },
    });

    return result;
  }

  async success(message: string, title = 'Successfully') {
    const result = await Swal.fire({
      title: title,
      text: message,
      icon: 'success',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes!',
      customClass: {
        popup: 'small-swal',
      }
    });
    return result;
  }

  successToast(msg: string) {
    this.showToast(msg, 'success', 'Operation successful!');
  }

  errorToast(msg: string) {
    this.showToast(msg, 'error', 'Something went wrong!');
  }

  warningToast(msg: string) {
    this.showToast(msg, 'warning', 'Something went wrong!');
  }

  infoToast(msg: string) {
    this.showToast(msg, 'info', 'Something went wrong!');
  }

  showToast(msg: string, icon: 'success' | 'error' | 'warning' | 'info', defaultMsg: string = 'Something went wrong!') {
    Swal.fire({
      text: msg ?? defaultMsg,
      icon: icon,
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 3000,
      customClass: {
        popup: 'small-swal',
      },
    }).then();
  }
}
