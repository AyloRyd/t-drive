export default function Layout(props: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[100dvh] flex-col justify-between bg-linear-to-br from-gray-950 via-gray-900 to-gray-800 text-white antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
      {props.children}
    </div>
  );
}
