type Props = {
  level: 'easy' | 'hard';
  message: string;
};

export default function AgentMessage({ level, message }: Props) {
  const isEasy = level === 'easy';
  const icon = isEasy ? '🌱' : '⚡';
  const tone = isEasy ? 'from-emerald-500 to-teal-500' : 'from-amber-500 to-rose-500';

  return (
    <div className="flex items-start gap-4">
      <div className="text-3xl select-none" aria-hidden>
        {icon}
      </div>
      <div className={`relative rounded-2xl p-5 bg-white/90 text-slate-800 shadow-xl border border-white/50` }>
        <div className={`absolute -top-3 left-4 w-24 h-1 rounded-full bg-gradient-to-r ${tone}`}></div>
        <p className="text-base md:text-lg font-medium leading-relaxed">
          <span className="font-bold mr-2">Guru:</span>
          {message}
        </p>
        <p className="mt-2 text-xs text-slate-500">Decision level: <span className="font-semibold">{level}</span></p>
      </div>
    </div>
  );
}
