import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'arrow-up-right'
  | 'arrow-right'
  | 'arrow-left'
  | 'arrow-down'
  | 'arrow-up'
  | 'menu'
  | 'close'
  | 'mail'
  | 'phone'
  | 'copy'
  | 'check'
  | 'download'
  | 'github'
  | 'linkedin'
  | 'external'
  | 'trophy'
  | 'tiktok'
  | 'mic'
  | 'play'
  | 'pause'
  | 'chevron-down';

/** Icônes SVG inline (trait 1.5px, couleur = currentColor). */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', class: 'icon' },
  styles: `
    :host {
      display: inline-flex;
      width: var(--icon-size, 1.125em);
      height: var(--icon-size, 1.125em);
      flex: none;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      @switch (name()) {
        @case ('arrow-up-right') {
          <path d="M7 17 17 7M8 7h9v9" />
        }
        @case ('arrow-right') {
          <path d="M5 12h14M13 6l6 6-6 6" />
        }
        @case ('arrow-left') {
          <path d="M19 12H5M11 6l-6 6 6 6" />
        }
        @case ('arrow-down') {
          <path d="M12 5v14M6 13l6 6 6-6" />
        }
        @case ('arrow-up') {
          <path d="M12 19V5M6 11l6-6 6 6" />
        }
        @case ('menu') {
          <path d="M4 8h16M4 16h16" />
        }
        @case ('close') {
          <path d="M6 6l12 12M18 6 6 18" />
        }
        @case ('mail') {
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        }
        @case ('phone') {
          <path
            d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"
          />
        }
        @case ('copy') {
          <rect x="9" y="9" width="12" height="12" rx="2" />
          <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
        }
        @case ('check') {
          <path d="m5 12 5 5L20 7" />
        }
        @case ('download') {
          <path d="M12 4v12M6 10l6 6 6-6M5 20h14" />
        }
        @case ('external') {
          <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
        }
        @case ('github') {
          <path
            d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"
          />
        }
        @case ('trophy') {
          <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
          <path d="M8 6H5a1 1 0 0 0-1 1v1a3 3 0 0 0 3 3h1.3M16 6h3a1 1 0 0 1 1 1v1a3 3 0 0 1-3 3h-1.3" />
          <path d="M12 13v3M9 20h6M10 16h4l.5 4h-5l.5-4Z" />
        }
        @case ('tiktok') {
          <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
          <path d="M14 3c.4 2.6 2.2 4.4 5 4.6" />
        }
        @case ('mic') {
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" />
        }
        @case ('play') {
          <path d="M8 5.5v13l10.5-6.5L8 5.5Z" />
        }
        @case ('pause') {
          <path d="M9 5v14M15 5v14" />
        }
        @case ('chevron-down') {
          <path d="m6 9 6 6 6-6" />
        }
        @case ('linkedin') {
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" />
        }
      }
    </svg>
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
}
