export default function Layout(props: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-gray-950 via-gray-900 to-gray-800 p-4 text-white">
      <main className="text-center">{props.children}</main>
    </div>
  );
}
