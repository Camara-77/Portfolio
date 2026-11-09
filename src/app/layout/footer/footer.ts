import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../data/portfolio.data';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-footer',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <div class="container footer__inner">
        <p class="footer__copy">{{ data.footer }}</p>

        <ul class="footer__links">
          <li>
            <a [href]="data.identity.github.href" target="_blank" rel="noopener">
              <app-icon name="github" />
              <span>{{ data.identity.github.label }}</span>
            </a>
          </li>
          <li>
            <a [href]="data.identity.linkedin.href" target="_blank" rel="noopener">
              <app-icon name="linkedin" />
              <span>{{ data.identity.linkedin.label }}</span>
            </a>
          </li>
          <li>
            <a href="#top" class="footer__top">
              <span>Haut de page</span>
              <app-icon name="arrow-up" />
            </a>
          </li>
        </ul>
      </div>
    </footer>
  `,
  styles: `
    @use 'tokens' as *;

    .footer {
      position: relative;
      border-top: 1px solid var(--line);
      padding-block: 2rem calc(2rem + env(safe-area-inset-bottom));
    }

    .footer__inner {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;

      @include up($bp-md) {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }

    .footer__copy {
      font-size: 0.875rem;
      color: var(--text-2);
    }

    .footer__links {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem 1.5rem;

      a {
        @include mono-label(0.6875rem);
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        min-height: 44px;
        color: var(--text-2);
        transition: color 0.3s var(--ease-out);

        @include hover {
          color: var(--text);
        }
      }
    }
  `,
})
export class Footer {
  protected readonly data = PORTFOLIO;
}
