// src/app/services/font.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FontService {
  fontsLoaded = false;

  constructor() {}

  async loadFonts(): Promise<void> {
    if (this.fontsLoaded) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'assets/fonts/poppins-font.js';

      script.onload = () => {
        console.log('Fonts loaded successfully');
        this.fontsLoaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load font script'));
      };

      document.head.appendChild(script);
    });
  }
}
