"use client";
import React, { useState, useEffect } from "react";

export default function AdminPromos() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // form state
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/promos");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPromos(data);
    } catch (err) {
      showToast("Error loading promo codes", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { code, discountPercent: Number(discountPercent), isActive };
      const res = await fetch("/api/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("Promo code created successfully!", "success");
        setShowForm(false);
        setCode("");
        setDiscountPercent("");
        setIsActive(true);
        fetchPromos();
      } else {
        const errorData = await res.json();
        showToast(errorData.error || "Error creating promo code.", "error");
      }
    } catch (err) {
      showToast("Error: " + (err as Error).message, "error");
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/promos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      showToast(`Promo code ${!currentStatus ? 'activated' : 'deactivated'}`, "success");
      setPromos(promos.map((p: any) => p.id === id ? { ...p, isActive: !currentStatus } : p));
    } catch (err) {
      showToast("Error updating status.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo code?")) return;
    try {
      const res = await fetch(`/api/promos/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Promo code deleted successfully", "success");
        fetchPromos();
      } else {
        showToast("Failed to delete promo code", "error");
      }
    } catch (err) {
      showToast("Error deleting promo code", "error");
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      {toast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-xl shadow-xl z-[4000] text-white font-medium animate-in slide-in-from-bottom-4 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-black text-gray-900 tracking-tight">Promo Codes</h1>
          <p className="text-gray-500 mt-1 font-medium text-sm">Create and manage discount codes.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="bg-[#0a0a0a] text-white px-6 py-3 rounded-xl font-bold tracking-wide hover:bg-gray-800 transition-colors shadow-lg shadow-black/10 flex items-center gap-2"
        >
          {showForm ? "Cancel" : "➕ Create Promo"}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 bg-white p-8 rounded-3xl shadow-sm border border-gray-200/60 animate-in slide-in-from-top-4">
          <h2 className="text-xl font-bold mb-6 text-gray-900 border-b pb-4">Create New Promo Code</h2>
          <form onSubmit={handleAddPromo} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Code Name</label>
              <input required value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#98202E] focus:outline-none uppercase" placeholder="e.g. SUMMER20" />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700">Discount Percentage (%)</label>
              <input required type="number" min="1" max="100" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)} className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#98202E] focus:outline-none" placeholder="20" />
            </div>

            <div className="flex items-center gap-3 md:col-span-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-5 h-5 accent-[#98202E]" />
              <label htmlFor="isActive" className="text-sm font-bold text-gray-700 cursor-pointer">Active</label>
              <span className="text-xs text-gray-500 ml-2">(Customers can use this code right now)</span>
            </div>

            <div className="md:col-span-2 pt-4">
              <button type="submit" className="w-full bg-[#98202E] text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#7a1a25] transition-colors shadow-lg shadow-[#98202E]/30">
                Create Promo Code
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-medium animate-pulse">Loading promo codes...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200">
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Code</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Discount</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {promos.length === 0 ? (
                  <tr><td colSpan={4} className="p-12 text-center text-gray-500">No promo codes found.</td></tr>
                ) : (
                  promos.map((p: any) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-6">
                        <div className="font-mono text-lg font-black text-[#98202E] bg-[#98202E]/5 inline-block px-3 py-1 border border-[#98202E]/20 rounded-lg">
                          {p.code}
                        </div>
                      </td>
                      <td className="p-6 font-bold text-gray-900 text-lg">
                        {p.discountPercent}% OFF
                      </td>
                      <td className="p-6">
                        <button 
                          onClick={() => toggleStatus(p.id, p.isActive)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors border ${p.isActive ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}`}
                        >
                          {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </button>
                      </td>
                      <td className="p-6 text-right">
                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-white hover:bg-red-500 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-red-600 text-sm font-medium shadow-sm">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
