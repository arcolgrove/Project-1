export default function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 rounded-md border border-orange/40 bg-orange/10 px-3 py-2 text-sm">{children}</p>
  );
}
