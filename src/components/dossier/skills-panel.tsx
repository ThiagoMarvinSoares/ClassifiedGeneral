"use client";

import { useCharacter } from "@/components/character-provider";
import {
  ABILITY_SHORT,
  signed,
  skillModifier,
  type Ability,
  type Proficiency,
} from "@/lib/character";

/** Escala fixa da barra: dá a um −1 uma barra curta e a um +9 a barra cheia. */
const BAR_MIN = -3;
const BAR_MAX = 9;

const NEXT_PROFICIENCY: Record<Proficiency, Proficiency> = {
  none: "proficient",
  proficient: "expertise",
  expertise: "none",
};

const PROFICIENCY_LABEL: Record<Proficiency, string> = {
  none: "sem proficiência",
  proficient: "proficiente",
  expertise: "especialista",
};

export function SkillsPanel() {
  const { character, update } = useCharacter();

  return (
    <aside className="relative rounded-[3px] border border-line bg-panel-2 p-3 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.9)] sm:p-4">
      {/* prendedor metálico da prancheta */}
      <div
        aria-hidden
        className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rounded-[2px] border border-line"
        style={{
          backgroundImage: "linear-gradient(180deg, #9aa0a4, #5d6367 55%, #383d40)",
        }}
      />

      <div className="rounded-[2px] border border-line-soft bg-panel/60 px-3 pb-4 pt-6 sm:px-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.26em] text-bone">Skills</h2>

        <ul className="space-y-px">
          {character.skills.map((skill, index) => {
            const previous = character.skills[index - 1];
            const newGroup = previous && previous.ability !== skill.ability;
            const modifier = skillModifier(character, skill);
            const fill = Math.max(
              4,
              Math.min(100, ((modifier - BAR_MIN) / (BAR_MAX - BAR_MIN)) * 100),
            );

            return (
              <li
                key={skill.id}
                className={`flex items-center gap-1.5 py-[3px] ${
                  newGroup ? "mt-2 border-t border-line-soft pt-2.5" : ""
                }`}
              >
                <AbilityBadge ability={skill.ability} />
                <span className="min-w-0 shrink-0 truncate text-[0.72rem] text-bone">
                  {skill.name}
                </span>
                <span
                  aria-hidden
                  className="min-w-3 flex-1 -translate-y-[0.3em] border-b border-dotted border-line"
                />
                <span className="w-7 shrink-0 text-right text-[0.72rem] font-medium tabular-nums text-bone">
                  {signed(modifier)}
                </span>
                <span className="hidden h-2.5 w-20 shrink-0 border border-line bg-black/40 p-px sm:block">
                  <span
                    className={`block h-full ${modifier < 0 ? "bg-alert/60" : "bg-mil-dim"}`}
                    style={{ width: `${fill}%` }}
                  />
                </span>
                <button
                  type="button"
                  onClick={() =>
                    update((draft) => {
                      draft.skills[index].proficiency = NEXT_PROFICIENCY[skill.proficiency];
                    })
                  }
                  aria-label={`${skill.name}: ${PROFICIENCY_LABEL[skill.proficiency]}. Clique para alternar`}
                  className="touch-target w-8 shrink-0 rounded-[2px] text-right text-[0.65rem] leading-none text-brass
                             transition-colors hover:bg-white/5 hover:text-mil-bright
                             focus-visible:bg-white/5 focus-visible:outline-none"
                >
                  {skill.proficiency === "expertise"
                    ? "★★"
                    : skill.proficiency === "proficient"
                      ? "★"
                      : <span className="text-bone-dim/25">☆</span>}
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 flex items-center justify-center gap-4 border-t border-line-soft pt-3 text-[0.55rem] uppercase tracking-[0.2em] text-bone-dim">
          <span>
            <span className="text-brass">★</span> Proficiency
          </span>
          <span>
            <span className="text-brass">★★</span> Expertise
          </span>
        </p>
      </div>
    </aside>
  );
}

function AbilityBadge({ ability }: { ability: Ability }) {
  return (
    <span className="w-7 shrink-0 rounded-[2px] border border-line-soft py-px text-center font-mono text-[0.48rem] uppercase tracking-[0.06em] text-bone-dim/70">
      {ABILITY_SHORT[ability]}
    </span>
  );
}
