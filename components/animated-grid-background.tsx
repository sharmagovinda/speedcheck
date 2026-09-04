export function AnimatedGridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full opacity-[0.35] dark:opacity-[0.15]">
        <defs>
          <pattern id="grid-pattern" width="44" height="44" patternUnits="userSpaceOnUse">
            <path
              d="M 44 0 L 0 0 0 44"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-border"
            />
          </pattern>
          <radialGradient id="grid-fade" cx="50%" cy="30%" r="65%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="grid-mask">
            <rect width="100%" height="100%" fill="url(#grid-fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" mask="url(#grid-mask)" />
      </svg>

      <div
        className="absolute left-1/2 top-[-10%] size-[36rem] -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl motion-safe:animate-[pulse_8s_ease-in-out_infinite] dark:bg-blue-500/10"
      />
      <div
        className="absolute right-[10%] top-[20%] size-72 rounded-full bg-teal-400/20 blur-3xl motion-safe:animate-[pulse_10s_ease-in-out_infinite] dark:bg-teal-400/10"
      />
    </div>
  );
}
