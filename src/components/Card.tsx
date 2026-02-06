export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        group relative
        rounded-xl p-6 shadow-lg transition-all duration-300 ease-out

        /* Light mode glass */
        bg-[rgba(255,255,255,0.55)]
        backdrop-blur-md
        border border-[rgba(0,0,0,0.12)]
        text-[var(--foreground)]

        /* Dark mode glass */
        dark:bg-[rgba(30,60,120,0.45)]
        dark:backdrop-blur-xl
        dark:border dark:border-[rgba(255,255,255,0.15)]
        dark:text-[var(--foreground)]

        /* Hover grow */
        hover:scale-[1.02]
        hover:shadow-xl
      "
    >
      {/* Glow overlay */}
      <div
        className="
          absolute inset-0 rounded-xl pointer-events-none
          opacity-0 transition-opacity duration-300

          /* Light mode glow */
          bg-gradient-to-r from-[rgba(255,255,255,0.4)] via-transparent to-[rgba(255,255,255,0.4)]

          /* Dark mode glow */
          dark:from-[rgba(80,120,255,0.25)]
          dark:via-transparent
          dark:to-[rgba(80,120,255,0.25)]

          /* Gold accent on hover */
          group-hover:opacity-100
          group-hover:border-[var(--gold)]
        "
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

