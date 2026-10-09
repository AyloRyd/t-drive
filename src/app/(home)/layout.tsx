export default function Layout(props: { children: React.ReactNode }) {
  // Background lives in GridBackground so every public page shares one
  // surface; this only carries the text and selection defaults.
  return (
    <div className="bg-gray-950 text-white antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
      {props.children}
    </div>
  );
}
