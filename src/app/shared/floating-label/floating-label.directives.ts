import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appFloatingLabel]',
  standalone: true
})
export class FloatingLabelDirective {

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input')
  @HostListener('blur')
  onChange(): void {
    this.toggleLabel();
  }

  ngAfterViewInit(): void {
    this.toggleLabel();
  }

  private toggleLabel(): void {
    const input = this.el.nativeElement;
    const parent = input.closest('.floating-label');
    if (parent) {
      if (input.value) {
        parent.classList.add('filled');
      } else {
        parent.classList.remove('filled');
      }
    }
  }
}
