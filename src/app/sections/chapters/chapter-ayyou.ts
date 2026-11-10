import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../data/portfolio.data';
import { ChapterHead } from './chapter-head';
import { Scene } from '../../layout/stage/scene';
import { RevealDirective } from '../../core/directives/reveal.directive';
import { Milestones } from './milestones';
import { ProjectList } from './project-list';
import { AwardGallery } from './award-gallery/award-gallery';
import { Button } from '../../shared/button/button';
import { Icon } from '../../shared/icon/icon';
import { NumText } from '../../shared/num-text/num-text';

/** Chapitre 3 · AYYOU (2026). */
@Component({
  selector: 'app-chapter-ayyou',
  imports: [ChapterHead, Milestones, ProjectList, AwardGallery, Button, Icon, NumText, Scene, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chapter-ayyou.html',
  styleUrl: './chapter-ayyou.scss',
})
export class ChapterAyyou {
  protected readonly c = PORTFOLIO.ayyou;
  protected readonly site = PORTFOLIO.ayyou.links[0];
  protected readonly org = PORTFOLIO.ayyou.links[1];
}
