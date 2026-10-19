import type { ReactNode } from 'react';
import type { StatKey } from '../../core/types';
import { useUi } from '../../store/langStore';

const STAT_KEYS: StatKey[] = ['economy', 'treasury', 'approval', 'eliteLoyalty', 'stability', 'development', 'corruption'];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1 desktop:gap-dp-12">
      <h2 className="font-serif text-label leading-tight desktop:text-dp-32">{title}</h2>
      <div className="flex flex-col gap-0.5 text-caption leading-[1.45] text-(--muted) desktop:text-dp-19 desktop:leading-[1.55]">{children}</div>
    </section>
  );
}

/** «Name — text» line inside a section: the name in the text color, the rest muted. */
function Item({ name, children }: { name: string; children: ReactNode }) {
  return (
    <p>
      <span className="text-(--text)">{name}</span> — {children}
    </p>
  );
}

/**
 * Settings → Справка (handoff screen 10, revised): the five rule sections inline in a two-column
 * grid — no sub-navigation, no pop-up. Copy is the localized `ui.help` reference text.
 */
export function HelpSections() {
  const ui = useUi();
  const h = ui.help;
  return (
    <div className="grid grid-cols-2 gap-x-sp-6 gap-y-sp-4 pb-sp-2 desktop:gap-x-dp-64 desktop:gap-y-dp-40">
      <Section title={h.stats.heading}>
        {STAT_KEYS.map((k) => (
          <Item key={k} name={ui.stats[k]}>
            {h.stats[k]}
          </Item>
        ))}
      </Section>
      <Section title={h.vector.heading}>
        <Item name={ui.vector.scale.democracy}>{h.vector.democratic}</Item>
        <Item name={ui.vector.scale.authoritarianism}>{h.vector.authoritarian}</Item>
        <Item name={ui.vector.scale.totalitarianism}>{h.vector.totalitarian}</Item>
      </Section>
      <Section title={h.elections.heading}>
        <p>{h.elections.text}</p>
      </Section>
      <Section title={h.defeats.heading}>
        <p>{h.defeats.coup}</p>
        <p>{h.defeats.revolution}</p>
        <p>{h.defeats.default}</p>
        <p>{h.defeats.elections}</p>
      </Section>
      <Section title={h.reforms.heading}>
        <p>{h.reforms.text}</p>
      </Section>
    </div>
  );
}
