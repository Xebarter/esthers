import { useNavigate } from "react-router-dom";

// Lucide SVG Icons (inline for reliability & quality)
const SocialIcon = ({ name }: { name: string }) => {
  const getIcon = () => {
    switch (name.toLowerCase()) {
      case "facebook":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.891h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
          </svg>
        );
      case "instagram":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.204-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
        );
      case "x":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );
      case "whatsapp":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.506-.173-.006-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.005 0C5.426 0 .064 5.345.06 11.936c0 2.096.547 4.142 1.588 5.945L.054 23.75l5.887-1.534a11.728 11.728 0 005.935 1.56c6.588 0 11.958-5.345 11.963-11.941.001-2.124-.554-4.19-1.615-5.985z" />
          </svg>
        );
      case "tiktok":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.32 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return getIcon();
};

export function Footer() {
  const navigate = useNavigate();
  
  // WhatsApp direct chat link
  const whatsappNumber = "+256704682885";
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=Hello%20Alethea%20Industrials!%20I'd%20like%20to%20inquire%20about%20your%20products`;

  // Social links (icons now rendered via inline SVG)
  const socialLinks = [
    { name: "Facebook", url: "https://facebook.com/aletheaindustrials" },
    { name: "Instagram", url: "https://instagram.com/aletheaindustrials" },
    { name: "X", url: "https://x.com/aletheaindustrials" },
    { name: "WhatsApp", url: whatsappLink },
    { name: "TikTok", url: "https://tiktok.com/@aletheaindustrials" },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 text-amber-50 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16">
          {/* Brand section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black bg-gradient-to-r from-amber-300 to-yellow-500 text-transparent bg-clip-text">
                DaviD's
              </span>
              <span>PERFUMES</span>
            </div>
            <p className="text-amber-200 text-sm leading-relaxed">
              Curating the world's most exquisite fragrances since 1995. 
              Experience the art of fine perfumery.
            </p>
            <div className="flex space-x-4">
              {['Facebook', 'Instagram', 'X', 'WhatsApp', 'TikTok'].map((social) => (
                <a 
                  key={social}
                  href={socialLinks.find(link => link.name === social)?.url || "#"} 
                  className="w-10 h-10 border border-amber-600/50 rounded-full flex items-center justify-center text-amber-50 hover:bg-amber-600/50 transition-colors"
                >
                  <SocialIcon name={social} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-bold text-lg mb-6">Discover</h3>
            <ul className="space-y-4">
              <li><button onClick={() => navigate('/')} className="text-amber-200 hover:text-amber-50 transition-colors text-left">Our Fragrances</button></li>
              <li><button onClick={() => navigate('/journal')} className="text-amber-200 hover:text-amber-50 transition-colors text-left">Perfume Journal</button></li>
              <li><button onClick={() => navigate('/')} className="text-amber-200 hover:text-amber-50 transition-colors text-left">How to Wear</button></li>
              <li><button onClick={() => navigate('/')} className="text-amber-200 hover:text-amber-50 transition-colors text-left">Gift Sets</button></li>
              <li><button onClick={() => navigate('/')} className="text-amber-200 hover:text-amber-50 transition-colors text-left">Limited Editions</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-6">Visit Us</h3>
            <div className="space-y-4 text-amber-200 text-sm">
              <p>55 Rue du Faubourg Saint-Honoré
                <br />
                Paris, 75008
                <br />
                France
              </p>
              <p>
                <a href="mailto:concierge@davids-perfumes.com" className="hover:text-amber-50 transition-colors">
                  concierge@davids-perfumes.com
                </a>
              </p>
              <p>
                <a href="tel:+33142685400" className="hover:text-amber-50 transition-colors">
                  +33 (0)1 42 68 54 00
                </a>
              </p>
              <p>By appointment only</p>
            </div>
          </div>
        </div>

        <div className="border-t border-amber-600/30 pt-8 pb-12 text-center">
          <p className="text-amber-300 text-sm">
            © {new Date().getFullYear()} DaviD's Perfumes. All rights reserved. Crafted with passion in Paris.
          </p>
        </div>
      </div>
    </footer>
  );
}