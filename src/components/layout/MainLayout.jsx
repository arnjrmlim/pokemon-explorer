import Header from "./Header";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#080C17] text-white">
      <Header />

      <main className="mx-auto w-full max-w-7xl px-5 py-10 lg:px-8">
        {children}
      </main>
    </div>
  );
}