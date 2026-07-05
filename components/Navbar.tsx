"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // NextAuth Session
  const { data: session } = useSession();

  // This hook tells the Navbar exactly which page it is currently on
  const pathname = usePathname();
  const isGearsPage = pathname === "/gears";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchCounts = async () => {
      if (session?.user) {
        try {
          const [cartRes, wishlistRes] = await Promise.all([
            fetch('/api/cart'),
            fetch('/api/wishlist')
          ]);
          if (cartRes.ok) {
            const cart = await cartRes.json();
            const totalItems = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
            setCartCount(totalItems);
          }
          if (wishlistRes.ok) {
            const wishlist = await wishlistRes.json();
            setWishlistCount(wishlist.length);
          }
        } catch (error) {
          console.error("Failed to fetch counts", error);
        }
      } else {
        setCartCount(0);
        setWishlistCount(0);
      }
    };

    fetchCounts();
    window.addEventListener("cartUpdated", fetchCounts);
    window.addEventListener("wishlistUpdated", fetchCounts);

    return () => {
      window.removeEventListener("cartUpdated", fetchCounts);
      window.removeEventListener("wishlistUpdated", fetchCounts);
    };
  }, [session]);

  // --- DYNAMIC STYLING LOGIC ---
  const headerClasses = isGearsPage
    ? (scrolled || menuOpen ? "px-[5%] py-4 bg-white text-black shadow-md" : "px-[5%] py-6 bg-[#0a0a0a] text-white")
    : (scrolled || menuOpen ? "px-[5%] py-3 bg-[#98202E] text-[#F9EAEA] shadow-md" : "px-[5%] py-6 bg-[#F9EAEA]/80 backdrop-blur-md border-b border-[#98202E]/10 text-[#98202E]");

  const logoClasses = isGearsPage
    ? "invert"
    : (scrolled || menuOpen ? "brightness-0 invert" : "");

  const cartBadgeClasses = isGearsPage
    ? (scrolled || menuOpen ? "bg-black text-white" : "bg-white text-black")
    : (scrolled || menuOpen ? "bg-white text-[#98202E]" : "bg-[#98202E] text-white");

  const hamburgerClasses = isGearsPage
    ? (scrolled || menuOpen ? "bg-black" : "bg-white")
    : (scrolled || menuOpen ? "bg-white" : "bg-[#98202E]");

  const mobileMenuClasses = isGearsPage ? "bg-[#0a0a0a]" : "bg-[#98202E]";

  return (
    <>
      <header className={`fixed top-0 w-full flex justify-between items-center z-[2000] transition-all duration-500 ${headerClasses}`}>
        <Link href="/" className="flex items-center gap-3 z-[2001] no-underline">
          <img
            src="/g_g_logo_bg-removebg-preview.png"
            alt="Glaze & Gear Logo"
            className={`w-[45px] h-[45px] object-contain drop-shadow-sm transition-all duration-500 ${logoClasses}`}
          />
          <div className="text-xl font-extrabold tracking-tight uppercase">
            Glaze & Gear
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          <Link href="/#shop" className="font-bold text-sm uppercase tracking-widest relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-current after:transition-all after:duration-500 hover:after:w-full">Glaze</Link>
          <Link href="/gears" className="font-bold text-sm uppercase tracking-widest relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-current after:transition-all after:duration-500 hover:after:w-full">Gears</Link>
          <Link href="/products" className="font-bold text-sm uppercase tracking-widest relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-current after:transition-all after:duration-500 hover:after:w-full">All Products</Link>
          <Link href="/about" className="font-bold text-sm uppercase tracking-widest relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-current after:transition-all after:duration-500 hover:after:w-full">About</Link>
          
          <div className="w-px h-6 bg-current opacity-20 mx-2"></div>
          
          {session ? (
            <>
              {session.user?.role === "ADMIN" && (
                <Link href="/admin" className="font-black text-sm uppercase tracking-widest relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-current after:transition-all after:duration-500 hover:after:w-full">Dashboard</Link>
              )}
              <Link href="/account/settings" className="font-bold text-sm uppercase tracking-widest relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-current after:transition-all after:duration-500 hover:after:w-full">Account</Link>
              <Link href="/account/orders" className="font-bold text-sm uppercase tracking-widest relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-current after:transition-all after:duration-500 hover:after:w-full">My Orders</Link>
              <button onClick={() => signOut()} className="font-bold text-sm uppercase tracking-widest relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-current after:transition-all after:duration-500 hover:after:w-full">Logout</button>
            </>
          ) : (
            <Link href="/login" className="font-bold text-sm uppercase tracking-widest relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-current after:transition-all after:duration-500 hover:after:w-full">Login</Link>
          )}

          <Link href="/wishlist" className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-gray-500/10 relative ml-2">
            ❤️
            <span className={`absolute -top-1 -right-1 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-black shadow-md transition-colors ${cartBadgeClasses}`}>
              {wishlistCount}
            </span>
          </Link>
          <Link href="/cart" className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-gray-500/10 relative">
            🛒
            <span className={`absolute -top-1 -right-1 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-black shadow-md transition-colors ${cartBadgeClasses}`}>
              {cartCount}
            </span>
          </Link>
        </nav>

        {/* Mobile Hamburger Icon */}
        <div
          className="lg:hidden flex flex-col gap-[6px] cursor-pointer z-[2002] p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={`block w-[28px] h-[2px] transition-all duration-500 ${hamburgerClasses} ${menuOpen ? "translate-y-[8px] rotate-45" : ""}`} />
          <span className={`block w-[28px] h-[2px] transition-all duration-500 ${hamburgerClasses} ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-[28px] h-[2px] transition-all duration-500 ${hamburgerClasses} ${menuOpen ? "-translate-y-[8px] -rotate-45" : ""}`} />
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <nav
        className={`fixed top-0 w-full h-screen flex flex-col justify-center items-center gap-8 transition-all duration-500 z-[1500] ${mobileMenuClasses} ${menuOpen ? "right-0" : "-right-full"}`}
      >
        <Link href="/#shop" onClick={() => setMenuOpen(false)} className="text-white text-3xl font-serif font-bold tracking-widest hover:scale-110 hover:opacity-70 transition-all">Glaze</Link>
        <Link href="/gears" onClick={() => setMenuOpen(false)} className="text-white text-3xl font-serif font-bold tracking-widest hover:scale-110 hover:opacity-70 transition-all">Gears</Link>
        <Link href="/products" onClick={() => setMenuOpen(false)} className="text-white text-3xl font-serif font-bold tracking-widest hover:scale-110 hover:opacity-70 transition-all">All Products</Link>
        
        {session ? (
          <>
            {session.user?.role === "ADMIN" && (
              <Link href="/admin" onClick={() => setMenuOpen(false)} className="text-white text-3xl font-serif font-black tracking-widest hover:scale-110 hover:opacity-70 transition-all">Dashboard</Link>
            )}
            <Link href="/account/settings" onClick={() => setMenuOpen(false)} className="text-white text-3xl font-serif font-bold tracking-widest hover:scale-110 hover:opacity-70 transition-all">Account</Link>
            <Link href="/account/orders" onClick={() => setMenuOpen(false)} className="text-white text-3xl font-serif font-bold tracking-widest hover:scale-110 hover:opacity-70 transition-all">My Orders</Link>
            <button onClick={() => { signOut(); setMenuOpen(false); }} className="text-white text-3xl font-serif font-bold tracking-widest hover:scale-110 hover:opacity-70 transition-all">Logout</button>
          </>
        ) : (
          <Link href="/login" onClick={() => setMenuOpen(false)} className="text-white text-3xl font-serif font-bold tracking-widest hover:scale-110 hover:opacity-70 transition-all">Login</Link>
        )}
        
        <Link href="/wishlist" onClick={() => setMenuOpen(false)} className="text-white text-3xl font-serif font-bold tracking-widest hover:scale-110 hover:opacity-70 transition-all mt-8">Wishlist ❤️ ({wishlistCount})</Link>
        <Link href="/cart" onClick={() => setMenuOpen(false)} className="text-white text-3xl font-serif font-bold tracking-widest hover:scale-110 hover:opacity-70 transition-all">Cart 🛒 ({cartCount})</Link>
      </nav>
    </>
  );
}