import { Directive, HostBinding, HostListener, OnDestroy } from '@angular/core';

@Directive({
  selector: 'button',
  standalone: true
})
export class ClickSpinnerDirective implements OnDestroy {
  @HostBinding('class.is-clicking') isClicking = false;
  @HostBinding('attr.aria-busy') get ariaBusy(): string | null {
    return this.isClicking ? 'true' : null;
  }

  private spinnerTimer?: ReturnType<typeof setTimeout>;

  @HostListener('click')
  showSpinner(): void {
    this.isClicking = true;
    clearTimeout(this.spinnerTimer);
    this.spinnerTimer = setTimeout(() => this.isClicking = false, 600);
  }

  ngOnDestroy(): void {
    clearTimeout(this.spinnerTimer);
  }
}
