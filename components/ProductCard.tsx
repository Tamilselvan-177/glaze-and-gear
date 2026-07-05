"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProductCard({ product }: { product: any }) {
  const { data: session, status } = useSession();
  const [inWishlist, setInWishlist] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      fetch('/api/wishlist')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setInWishlist(data.some((item: any) => item.productId === product.id));
          }
        })
        .catch(console.error);
    } else {
      setInWishlist(false);
    }
  }, [status, product.id]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status === "unauthenticated" || !session) {
      router.push("/login");
      return;
    }

    const previousState = inWishlist;
    setInWishlist(!inWishlist);

    try {
      if (previousState) {
        // Remove from wishlist
        await fetch(`/api/wishlist?productId=${product.id}`, { method: 'DELETE' });
      } else {
        // Add to wishlist
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id })
        });
      }
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      console.error(err);
      setInWishlist(previousState); // Revert on failure
    }
  };

  return (
    <Link href={`/products/${product.slug || product.id}`} className="no-underline block h-full">
      <div className="bg-white border border-[#98202E]/10 p-4 sm:p-6 rounded-[20px] transition-all duration-500 hover:-translate-y-[10px] hover:shadow-[0_30px_60px_rgba(152,32,46,0.15)] cursor-pointer text-left relative h-full flex flex-col group">
        
        {/* Wishlist Button */}
        <button 
          onClick={toggleWishlist}
          className="absolute top-6 right-6 z-10 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full shadow-sm flex items-center justify-center transition-transform hover:scale-110"
        >
          {inWishlist ? "❤️" : "🤍"}
        </button>

        <div className="w-full aspect-square rounded-xl mb-4 sm:mb-6 overflow-hidden relative">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
        </div>
        
        <div className="flex-1 flex flex-col">
          <p className="text-xs uppercase tracking-widest opacity-70 mb-2 text-[#98202E]">{product.category}</p>
          <h3 className="text-xl sm:text-2xl font-serif text-[#98202E] mb-2 line-clamp-1">{product.name}</h3>
          <p className="font-bold text-[#D09399] text-lg sm:text-xl mb-4 mt-auto">₹{product.price?.toLocaleString()}</p>
        </div>
      </div>
    </Link>
  );
}
