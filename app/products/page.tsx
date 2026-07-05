"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
};

export default function ProductsPage() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCategory = filter === "all" || p.category === filter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white min-h-screen text-[#98202E]">
      {/* Hero Section */}
      <section className="pt-[150px] pb-[50px] text-center bg-[radial-gradient(circle_at_center,#fff_0%,var(--white)_100%)]">
        <h1 className="text-5xl md:text-[5rem] font-black font-serif tracking-tight bg-gradient-to-b from-[#98202E] to-[#4a0e16] bg-clip-text text-transparent">
          Our Products
        </h1>
      </section>

      {/* Search and Filter */}
      <div className="py-8 px-[5%] flex flex-col items-center gap-6 bg-white w-full max-w-7xl mx-auto">
        <div className="w-full max-w-2xl relative flex items-center">
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-4 pl-8 pr-14 border-2 border-[#98202E]/20 rounded-full focus:outline-none focus:border-[#98202E] text-[#98202E] placeholder:text-[#98202E]/40 font-bold transition-all shadow-sm"
          />
          <span className="absolute right-6 opacity-50 text-xl pointer-events-none">
            🔍
          </span>
        </div>

        <div className="flex justify-center gap-3 flex-wrap">
          {[
            { id: "all", label: "All" },
            { id: "glaze", label: "Glaze" },
            { id: "gears", label: "Gears" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`py-3 px-6 border-2 border-[#98202E] font-bold text-sm uppercase tracking-widest rounded-full transition-all duration-300 ${
                filter === tab.id ? "bg-[#98202E] text-white shadow-lg shadow-[#98202E]/20" : "bg-white text-[#98202E] hover:bg-[#98202E]/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <section className="py-12 px-[5%] pb-[15vh] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 bg-white">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 p-6 rounded-[20px] animate-pulse">
              <div className="w-full aspect-square rounded-xl mb-6 bg-gray-200"></div>
              <div className="h-3 w-1/4 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
              <div className="h-5 w-1/2 bg-gray-200 rounded mb-6"></div>
              <div className="flex flex-col gap-2">
                <div className="w-full h-[40px] bg-gray-200 rounded"></div>
                <div className="w-full h-[40px] bg-gray-200 rounded"></div>
              </div>
            </div>
          ))
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 py-20 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-serif text-gray-400 italic mb-6 text-center">No products found matching your search.</h2>
            <button onClick={() => { setSearchQuery(""); setFilter("all"); }} className="px-8 py-3 bg-transparent border border-[#98202E] text-[#98202E] font-bold text-xs uppercase tracking-widest rounded-full hover:bg-[#98202E]/5 transition-all">
              Clear Filters
            </button>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </section>
    </div>
  );
}