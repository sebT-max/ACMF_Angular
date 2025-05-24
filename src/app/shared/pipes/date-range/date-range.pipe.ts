import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({
  name: 'dateRange',
  standalone: true
})
export class DateRangePipe implements PipeTransform {
  transform(start: Date | string, end: Date | string, locale: string = 'fr'): string {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const sameMonth = startDate.getMonth() === endDate.getMonth();

    if (sameMonth) {
      // ex: "12–15 sept."
      return `${startDate.getDate()}–${endDate.getDate()} ${formatDate(endDate, 'MMM', locale)}`;
    } else {
      // ex: "28 sept. – 2 oct."
      return `${formatDate(startDate, 'd MMM', locale)} – ${formatDate(endDate, 'd MMM', locale)}`;
    }
  }
}
