export function PageLoader() {
  return (
    <div className="min-h-screen bg-neu-bg flex items-center justify-center">
      <div className="p-8 border-2 border-neu-black shadow-neu bg-neu-white flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-[3px] border-neu-black border-t-neu-primary animate-spin" />
        <span className="font-mono text-xs text-neu-black/40 uppercase tracking-widest">Synectra</span>
      </div>
    </div>
  );
}
