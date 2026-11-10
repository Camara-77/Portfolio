import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Award } from '../../../data/portfolio.data';
import { Icon } from '../../../shared/icon/icon';

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input, select, textarea';

/**
 * Galerie du prix dans une modale en verre (élément <dialog> natif) :
 *  - grille bento, photos en noir et blanc qui reprennent leurs couleurs au survol
 *  - clic sur une photo : affichage en grand
 *  - fermeture : bouton ×, Échap (revient d'abord à la grille), clic sur le fond
 *  - le focus clavier reste dans la modale
 */
@Component({
  selector: 'app-award-gallery',
  imports: [Icon],
  templateUrl: './award-gallery.html',
  styleUrl: './award-gallery.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AwardGallery {
  readonly award = input.required<Award>();

  /** Index de la photo affichée en grand (null = grille). */
  protected readonly selected = signal<number | null>(null);

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly doc = inject(DOCUMENT);
  private lastThumb: HTMLElement | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const dialog = this.dialog().nativeElement;
      dialog.addEventListener('keydown', this.trapFocus);
      destroyRef.onDestroy(() => {
        dialog.removeEventListener('keydown', this.trapFocus);
        this.unlockScroll();
      });
    });
  }

  open(): void {
    const dialog = this.dialog().nativeElement;
    if (dialog.open) return;
    this.selected.set(null);
    this.doc.documentElement.style.overflow = 'hidden';
    dialog.showModal();
  }

  protected close(): void {
    this.dialog().nativeElement.close();
  }

  /** Événement natif « close » (bouton, Échap, clic sur le fond). */
  protected onClosed(): void {
    this.selected.set(null);
    this.unlockScroll();
  }

  /** Échap : revient d'abord à la grille si une photo est ouverte en grand. */
  protected onCancel(event: Event): void {
    if (this.selected() !== null) {
      event.preventDefault();
      this.back();
    }
  }

  /** Clic sur le fond (zone hors du panneau). */
  protected onBackdrop(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.close();
  }

  protected show(index: number, event: Event): void {
    this.lastThumb = event.currentTarget as HTMLElement;
    this.selected.set(index);
    // Focus sur « Retour » une fois la vue agrandie affichée
    queueMicrotask(() =>
      requestAnimationFrame(() =>
        this.dialog().nativeElement.querySelector<HTMLElement>('.gallery__back')?.focus(),
      ),
    );
  }

  protected back(): void {
    const thumb = this.lastThumb;
    this.selected.set(null);
    requestAnimationFrame(() => thumb?.focus());
  }

  protected step(delta: number): void {
    const n = this.award().photos.length;
    const i = this.selected();
    if (i !== null) this.selected.set((i + delta + n) % n);
  }

  protected onViewerKey(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') this.step(1);
    if (event.key === 'ArrowLeft') this.step(-1);
  }

  /** Tab / Maj+Tab bouclent sur les éléments de la modale. */
  private readonly trapFocus = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;
    const items = Array.from(
      this.dialog().nativeElement.querySelectorAll<HTMLElement>(FOCUSABLE),
    ).filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = this.doc.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  private unlockScroll(): void {
    this.doc.documentElement.style.overflow = '';
  }
}
