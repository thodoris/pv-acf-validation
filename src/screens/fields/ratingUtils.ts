/* Pure rating helpers — kept out of RatingControl.tsx so HMR fast-refresh
   stays happy (a file may export components OR helpers, not both). */

import type { Rating } from '@/content';
import type { RatingValue } from './RatingControl';

export function isStandardRatingAnswered(rating: Rating, value: RatingValue): boolean {
  if (rating.kind === 'grid') {
    if (!Array.isArray(value)) return false;
    return value.length === rating.rows.length && value.every((v) => typeof v === 'number');
  }
  return typeof value === 'number';
}
