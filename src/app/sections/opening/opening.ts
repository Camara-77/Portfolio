import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../data/portfolio.data';
import { Portrait } from './portrait/portrait';
import { VoiceMic } from '../../shared/audio/voice-mic';
import { Icon } from '../../shared/icon/icon';

/** Ouverture : nom, titre, note vocale de présentation, portrait. */
@Component({
  selector: 'app-opening',
  imports: [Portrait, VoiceMic, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="top" class="opening" aria-labelledby="opening-title">
      <div class="container opening__grid">
        <div class="opening__head">
          <p class="opening__place">
            <span class="opening__dot" aria-hidden="true"></span>
            {{ id.locationShort }}
          </p>
          <h1 id="opening-title" class="opening__name">
            @for (part of nameParts; track $index) {
              <span class="opening__line">{{ part }}{{ $last ? '' : ' ' }}</span>
            }
          </h1>
          <p class="opening__title">{{ id.title }}</p>
        </div>

        <div class="opening__visual">
          <app-portrait [alt]="'Portrait de ' + id.name" />
        </div>

        <div class="opening__rest">
          <app-voice-mic class="opening__voice" [note]="opening.voice" />

          <p class="opening__tagline lead">{{ id.tagline }}</p>

          <a class="opening__hint" href="#biologie">
            <span>{{ opening.scrollHint }}</span>
            <app-icon name="arrow-down" />
          </a>
        </div>
      </div>
    </section>
  `,
  styleUrl: './opening.scss',
})
export class Opening {
  protected readonly id = PORTFOLIO.identity;
  protected readonly opening = PORTFOLIO.opening;
  protected readonly nameParts = PORTFOLIO.identity.name.split(' ');
}
