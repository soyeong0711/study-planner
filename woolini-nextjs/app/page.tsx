import AppShell from './components/AppShell';

export default function Page() {
  return (
    <div className="phone-container w-full max-w-[420px] aspect-[9/19.5] bg-neutral-950 rounded-[48px] overflow-hidden relative flex flex-col border-[4px] border-neutral-800/80">
      <AppShell />
    </div>
  );
}
