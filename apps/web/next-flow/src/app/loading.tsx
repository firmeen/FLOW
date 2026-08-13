export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6">
      <div className="text-center" role="status" aria-live="polite">
        <span className="mx-auto mb-4 block size-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
        <p className="text-sm font-semibold text-foreground">Preparing FoodFlow...</p>
      </div>
    </main>
  );
}
