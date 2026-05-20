/* Question card — primary visual unit. Coral top accent, head with tag+meta,
   stem, italic descriptor, body slot for fields. */

import type { JSX, ReactNode } from 'react';

export type QuestionCardProps = {
  tag?: string;
  meta?: string;
  question: string;
  subtitle?: string;
  slot?: string;
  children: ReactNode;
};

export function QuestionCard({
  tag,
  meta,
  question,
  subtitle,
  slot,
  children,
}: QuestionCardProps): JSX.Element {
  const id = slot ? `q-text-${slot}` : 'q-text';
  return (
    <section className="q-card" aria-labelledby={id}>
      <div className="q-card__head">
        {tag && <span className="q-card__tag">{tag}</span>}
        {meta && <span className="q-card__meta">{meta}</span>}
      </div>
      <h2 id={id} className="q-card__text">
        {question}
      </h2>
      {subtitle && <p className="q-card__descriptor">{subtitle}</p>}
      <div className="q-card__body">{children}</div>
    </section>
  );
}
