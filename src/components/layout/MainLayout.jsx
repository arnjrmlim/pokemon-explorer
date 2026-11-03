import Header from "./Header";

export default function MainLayout({
  children,
  activePage,
  onNavigate,
  canCompare,
}) {
  return (
    <div className="min-h-screen bg-[#080C17]">
      <Header
        activePage={activePage}
        onNavigate={onNavigate}
        canCompare={canCompare}
      />
      {children}
    </div>
  );
}