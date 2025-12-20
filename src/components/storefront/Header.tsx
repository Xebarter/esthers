import { useState } from "react";
import { ShoppingCart, Phone, Menu } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  onCartClick: () => void;
}

export function Header({ onCartClick }: HeaderProps) {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();
  const navigate = useNavigate();
  const phoneNumber = "+256704682885";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Fragrances", path: "/" },
    { name: "About", path: "/about" },
    { name: "Journal", path: "/journal" },
    { name: "Admin", path: "/admin" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-xl border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span 
              onClick={() => navigate('/')} 
              className="text-3xl font-black bg-gradient-to-r from-amber-300 to-yellow-500 text-transparent bg-clip-text cursor-pointer"
            >
              DaviD's
            </span>
            <span className="text-amber-50">PERFUMES</span>
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-amber-50 hover:text-amber-300 transition-colors"
          >
            <Menu size={24} />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => navigate('/')} 
              className="text-amber-50 hover:text-amber-300 transition-colors font-medium"
            >
              Fragrances
            </button>
            <button 
              onClick={() => navigate('/about')} 
              className="text-amber-50 hover:text-amber-300 transition-colors font-medium"
            >
              About
            </button>
            <button 
              onClick={() => navigate('/journal')} 
              className="text-amber-50 hover:text-amber-300 transition-colors font-medium"
            >
              Journal
            </button>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={onCartClick} 
              className="relative p-2 text-amber-50 hover:text-amber-300 transition-colors"
            >
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            
            <button 
              onClick={() => navigate('/admin')} 
              className="hidden md:block text-sm text-amber-50 hover:text-amber-300 transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-gray-900 border-b border-gray-800 py-4 px-4">
            <nav className="space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-amber-50 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {item.name}
                </button>
              ))}
              
              <a
                href={`tel:${phoneNumber}`}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-amber-200 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Phone size={16} />
                Call Us
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}