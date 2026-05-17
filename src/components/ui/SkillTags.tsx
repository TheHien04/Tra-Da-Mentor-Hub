interface SkillTagsProps {
  skills: string[];
  max?: number;
}

export function SkillTags({ skills, max = 6 }: SkillTagsProps) {
  const visible = skills.slice(0, max);
  const rest = skills.length - visible.length;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((skill) => (
        <span
          key={skill}
          className="badge-pill badge-neutral"
        >
          {skill}
        </span>
      ))}
      {rest > 0 && <span className="text-xs text-muted self-center">+{rest}</span>}
    </div>
  );
}
