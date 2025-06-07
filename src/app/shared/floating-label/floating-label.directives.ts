import { AfterViewInit, Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appFloatingLabel]'
})
export class FloatingLabelDirective implements AfterViewInit {

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.toggleLabel();
  }

  @HostListener('input')
  @HostListener('blur')
  onInputOrBlur(): void {
    this.toggleLabel();
  }

  private toggleLabel(): void {
    const input = this.el.nativeElement as HTMLInputElement;
    const parent = input.closest('.floating-label');
    if (!parent) return;

    if (input.value && input.value.trim() !== '') {
      parent.classList.add('filled');
    } else {
      parent.classList.remove('filled');
    }
  }
}
