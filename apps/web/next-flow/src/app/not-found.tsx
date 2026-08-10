export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-sage">404 - Not on the floor plan</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-forest">We could not find that table.</h1>
        <p className="mt-3 text-sm leading-6 text-foreground/65">Use the demo launcher to enter a valid FoodFlow experience.</p>
        <a className="mt-7 inline-flex h-11 items-center rounded-lg bg-forest px-5 text-sm font-semibold text-white" href="/">Back to demo launcher</a>
      </div>
    </main>
  );
}
