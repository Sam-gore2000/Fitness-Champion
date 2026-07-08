export default function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div
      className="rounded-full border-[3px] border-brand-100 border-t-brand-600 animate-spin dark:border-brand-900/40 dark:border-t-brand-400"
      style={{ width: size, height: size }}
    />
  );
}
