import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../data/portfolio.data';
import { SectionTitle } from '../../shared/section-title/section-title';
import { GlassCard } from '../../shared/glass-card/glass-card';
import { Badge } from '../../shared/badge/badge';
import { Button } from '../../shared/button/button';
import { Icon } from '../../shared/icon/icon';
import { RevealDirective } from '../../core/directives/reveal.directive';
import { CountUpDirective } from '../../core/directives/count-up.directive';
import { AwardGallery } from './award-gallery/award-gallery';

@Component({
  selector: 'app-ayyou',
  imports: [SectionTitle, GlassCard, Badge, Button, Icon, RevealDirective, CountUpDirective, AwardGallery],
  templateUrl: './ayyou.html',
  styleUrl: './ayyou.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Ayyou {
  protected readonly p = PORTFOLIO.featured;
  protected readonly site = PORTFOLIO.featured.links[0];
  protected readonly org = PORTFOLIO.featured.links[1];

  protected pad(i: number): string {
    return String(i + 1).padStart(2, '0');
  }
}
