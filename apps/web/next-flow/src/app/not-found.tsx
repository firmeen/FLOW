export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">404 - Not on the floor plan</p>
        <h1 className="mt-3 font-heading text-3xl font-semibold uppercase tracking-[0.04em] text-foreground">We could not find that table.</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Use the demo launcher to enter a valid FoodFlow experience.</p>
        <a className="mt-7 inline-flex h-11 items-center bg-primary px-5 font-heading text-xs font-semibold uppercase tracking-[0.08em] text-primary-foreground" href="/">Back to demo launcher</a>
      </div>
    </main>
  );
}
