import { Search } from "lucide-react";
import PokeballIcon from "../common/PokeballIcon";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080C17]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">

        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          <PokeballIcon size={42} />

          <div>
            <h1 className="text-lg font-extrabold tracking-wide text-white">
              POKÉMON<span className="text-[#F6C945]"> EXPLORER</span>
            </h1>
            <p className="text-[10px] tracking-[0.2em] text-gray-500">
              EXPLORE THE POKÉMON WORLD
            </p>
          </div>
        </a>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#" className="text-sm font-medium text-[#F6C945]">
            Explore
          </a>
          <a href="#" className="text-sm text-gray-400 transition hover:text-white">
            Compare
          </a>
        </nav>

        {/* Mobile menu button */}
        <button className="rounded-lg p-2 text-gray-400 hover:bg-white/10 md:hidden">
          <Search size={21} />
        </button>

      </div>
    </header>
  );
}
