import { ShoppingCart, Phone } from "lucide-react";
import { useCart } from "../../contexts/CartContext";

interface HeaderProps {
  onCartClick: () => void;
}

export function Header({ onCartClick }: HeaderProps) {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();
  const phoneNumber = "+256704682885";

  return (
    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/85 border-b border-white/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 lg:h-24">

          {/* Brand */}
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-pink-600 to-purple-800 drop-shadow-md">
              Alethea
            </h1>
            <span className="text-xs sm:text-sm font-medium text-gray-600 tracking-widest uppercase -mt-1.5 opacity-90">
              Industrials Ltd
            </span>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-6 lg:gap-8">

            {/* Desktop Phone */}
            <a
              href={`tel:${phoneNumber}`}
              className="group hidden sm:flex items-center gap-2.5 text-gray-700 font-semibold hover:text-purple-700 transition-all duration-300"
            >
              <div className="p-2 rounded-lg bg-purple-100/60 group-hover:bg-purple-200/80 transition-colors">
                <Phone className="h-5 w-5 text-purple-700" />
              </div>
              <span className="text-sm lg:text-base">{phoneNumber}</span>
            </a>

            {/* Mobile Phone */}
            <a
              href={`tel:${phoneNumber}`}
              className="sm:hidden p-2.5 rounded-xl bg-purple-100/70 hover:bg-purple-200 transition-colors"
            >
              <Phone className="h-5 w-5 text-purple-700" />
            </a>

            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative group px-5 py-3.5 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white font-semibold shadow-xl hover:shadow-2xl hover:shadow-purple-500/50 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-3 overflow-visible"
            >
              <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12"></span>

              <ShoppingCart className="h-5 w-5 lg:h-6 lg:w-6 relative z-10" />
              <span className="hidden sm:inline text-sm lg:text-base relative z-10">Cart</span>

              {/* Compact Red Badge + Large Bold Number */}
              {totalItems > 0 && (
                <div className="absolute -top-2 -right-2 pointer-events-none">
                  <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white font-black text-base shadow-xl ring-4 ring-white">
                    {totalItems < 100 ? totalItems : "99+"}

                    {/* Subtle pulse rings */}
                    <span className="absolute inset-0 rounded-full bg-red-500/50 animate-ping"></span>
                  </span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

    </header>
  );
}
