export default function PublicHome() {
  return (
    <div className="relative">
      <div className="grain" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 text-center space-y-6">
        <h1 className="font-display text-5xl font-extrabold text-bone">TYKS</h1>
        <p className="text-bone-muted text-lg">La billetterie nouvelle génération.</p>
        <div>
          
            href="https://pro.tyks.app"
            className="inline-block rounded-full bg-bone px-6 py-3 text-sm font-semibold text-onyx hover:bg-white transition"
          >
            Espace Organisateur (Pro)
          </a>
        </div>
      </div>
    </div>
  );
}
