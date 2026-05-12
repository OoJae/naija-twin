export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold tracking-tight">Naija-Twin</h1>
        <p className="text-lg text-muted-foreground">
          Your AI twin that thinks Naija
        </p>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <div className="rounded-lg border p-4 max-w-md">
            <h2 className="font-semibold mb-2">Twin-Loop Architecture</h2>
            <p className="text-sm text-muted-foreground">
              A unified agentic system solving user modeling (Task A) and
              recommendation (Task B) with shared persona memory. Improvements
              to the brain lift both tasks at once.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="rounded-lg border p-4">
            <div className="text-2xl font-bold">TBD</div>
            <div className="text-xs text-muted-foreground">
              NDCG@10
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-2xl font-bold">TBD</div>
            <div className="text-xs text-muted-foreground">
              RMSE
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-2xl font-bold">TBD</div>
            <div className="text-xs text-muted-foreground">Faithfulness</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-2xl font-bold">TBD</div>
            <div className="text-xs text-muted-foreground">
              Nigerian-fit
            </div>
          </div>
        </div>
      </main>

      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-sm text-muted-foreground">
        <span>DSN x BCT LLM Agent Challenge 3.0</span>
        <span>Paper (coming soon)</span>
        <span>Demo (coming soon)</span>
      </footer>
    </div>
  );
}
