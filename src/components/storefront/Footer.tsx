import { useState } from "react";

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
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
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
  const navigateToAdmin = () => {
    window.history.pushState({}, "", "/admin");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

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
    <footer className="relative mt-20 overflow-hidden bg-gradient-to-t from-purple-950 via-purple-900 to-purple-800 border-t border-purple-700">
      {/* Background Glow */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-pink-600 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-gray-200">
          {/* Branding */}
          <div className="space-y-4">
            <h3 className="text-3xl font-extrabold bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent tracking-tight">
              Alethea Industrials
            </h3>
            <p className="text-purple-200 leading-relaxed">
              Premium industrial solutions for modern businesses.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xl font-bold mb-5">Products</h4>
            <ul className="space-y-3">
              {["New Arrivals", "Industrial Equipment", "Tools", "Supplies", "Custom Solutions"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-pink-300 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xl font-bold mb-5">Support</h4>
            <ul className="space-y-3">
              {["Contact Us", "Shipping & Delivery", "Returns & Exchanges", "FAQs"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-pink-300 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Admin */}
          <div>
            <h4 className="text-xl font-bold mb-5">Connect With Us</h4>

            <button
              onClick={navigateToAdmin}
              className="hover:text-pink-300 transition-colors flex items-center gap-2"
            >
              <span className="text-purple-400">Lock</span> Admin Portal
            </button>

            {/* Social Icons */}
            <div className="flex gap-5 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="group"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30 group-hover:border-white/50 group-hover:shadow-lg">
                    <div className={social.name.toLowerCase() === 'whatsapp' ? 'text-green-500' : 'text-white'}>
                      <SocialIcon name={social.name} />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-purple-600/50 mt-12 pt-8 text-center">
          <p className="text-purple-300 text-sm">
            © {new Date().getFullYear()} Alethea Industrials Ltd. All rights reserved.
          </p>
          <p className="text-purple-400 text-xs mt-2">
            Made with <span className="text-pink-400">Precision</span> in Uganda
          </p>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-50 group"
      >
        <div className="relative">
          <div className="w-16 h-16 text-green-500">
            <SocialIcon name="whatsapp" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative rounded-full h-5 w-5 bg-green-500"></span>
          </span>
        </div>
      </a>
    </footer>
  );
}