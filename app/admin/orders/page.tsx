"use client";
import React from "react";
import { useState, useEffect } from "react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [trackingInput, setTrackingInput] = useState("");
  const [savingTracking, setSavingTracking] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data);
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      setOrders(orders.map((o: any) => o.id === id ? { ...o, status: newStatus } : o));
      showToast("Order status updated successfully", "success");
    } catch (err) {
      showToast("Error updating order status", "error");
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setTrackingInput(order.trackingNumber || "");
  };

  const saveTracking = async () => {
    if (!selectedOrder) return;
    setSavingTracking(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber: trackingInput }),
      });
      if (!res.ok) throw new Error();
      setOrders(orders.map((o: any) => o.id === selectedOrder.id ? { ...o, trackingNumber: trackingInput } : o));
      setSelectedOrder({ ...selectedOrder, trackingNumber: trackingInput });
      showToast("Tracking number saved!", "success");
    } catch {
      showToast("Failed to save tracking number", "error");
    } finally {
      setSavingTracking(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-black text-gray-900 tracking-tight">Orders</h1>
          <p className="text-gray-500 mt-1 font-medium text-sm">View and manage customer transactions.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by ID, name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#98202E] text-sm w-full sm:w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#98202E] text-sm w-full sm:w-auto cursor-pointer bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#98202E] text-sm w-full sm:w-auto cursor-pointer bg-white"
          >
            <option value="ALL">All Dates</option>
            <option value="TODAY">Today</option>
            <option value="YESTERDAY">Yesterday</option>
            <option value="7DAYS">Last 7 Days</option>
            <option value="30DAYS">Last 30 Days</option>
            <option value="CUSTOM">Custom Range</option>
          </select>
        </div>
      </div>
      
      {dateFilter === 'CUSTOM' && (
        <div className="mb-8 flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-gray-200/60 shadow-sm animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold text-gray-700">From:</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#98202E] text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-bold text-gray-700">To:</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#98202E] text-sm" />
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-xl shadow-xl z-50 text-white font-medium animate-in slide-in-from-bottom-4 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200/60 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-medium animate-pulse">Loading orders...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200">
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID / Date</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Customer Details</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Payment</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="p-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Amount</th>
                  <th className="p-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(() => {
                  const filteredOrders = orders.filter((o: any) => {
                    // Status filter
                    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
                    
                    // Search filter
                    const query = searchQuery.toLowerCase();
                    const matchesSearch = !query || 
                      o.id.toLowerCase().includes(query) ||
                      (o.customerName && o.customerName.toLowerCase().includes(query)) ||
                      (o.customerEmail && o.customerEmail.toLowerCase().includes(query)) ||
                      (o.user?.name && o.user.name.toLowerCase().includes(query)) ||
                      (o.user?.email && o.user.email.toLowerCase().includes(query));

                    // Date filter
                    let matchesDate = true;
                    if (dateFilter !== 'ALL') {
                      const orderDate = new Date(o.createdAt);
                      orderDate.setHours(0, 0, 0, 0); // Normalize order date to midnight
                      
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      
                      const yesterday = new Date(today);
                      yesterday.setDate(yesterday.getDate() - 1);
                      
                      const sevenDaysAgo = new Date(today);
                      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                      
                      const thirtyDaysAgo = new Date(today);
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                      if (dateFilter === 'TODAY') {
                        matchesDate = orderDate.getTime() === today.getTime();
                      } else if (dateFilter === 'YESTERDAY') {
                        matchesDate = orderDate.getTime() === yesterday.getTime();
                      } else if (dateFilter === '7DAYS') {
                        matchesDate = orderDate >= sevenDaysAgo && orderDate <= today;
                      } else if (dateFilter === '30DAYS') {
                        matchesDate = orderDate >= thirtyDaysAgo && orderDate <= today;
                      } else if (dateFilter === 'CUSTOM') {
                        const start = startDate ? new Date(startDate) : null;
                        const end = endDate ? new Date(endDate) : null;
                        if (start) start.setHours(0, 0, 0, 0);
                        if (end) end.setHours(23, 59, 59, 999); // end of the chosen day
                        
                        if (start && end) {
                          matchesDate = orderDate >= start && orderDate <= end;
                        } else if (start) {
                          matchesDate = orderDate >= start;
                        } else if (end) {
                          matchesDate = orderDate <= end;
                        }
                      }
                    }

                    return matchesStatus && matchesSearch && matchesDate;
                  });

                  if (filteredOrders.length === 0) {
                    return <tr><td colSpan={6} className="p-12 text-center text-gray-500">No orders found.</td></tr>;
                  }

                  return filteredOrders.map((o: any) => (
                    <React.Fragment key={o.id}>
                      <tr className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => openOrderDetails(o)}>
                        <td className="p-6">
                          <div className="font-mono text-xs font-bold text-gray-900 bg-gray-100 inline-block px-2 py-1 rounded">
                            ...{o.id.slice(-6).toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-500 mt-2 font-medium">
                            {new Date(o.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="font-bold text-gray-900">{o.customerName || o.user?.name || 'Anonymous'}</div>
                          <div className="text-xs text-gray-500 mt-1">{o.customerEmail || o.user?.email || 'N/A'}</div>
                          {o.customerPhone && <div className="text-xs text-gray-500 mt-1">📞 {o.customerPhone}</div>}
                          {o.shippingAddress && (
                            <div className="text-xs text-gray-400 mt-1 line-clamp-1 max-w-[200px]" title={o.shippingAddress}>
                              📍 {o.shippingAddress}
                            </div>
                          )}
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                              o.paymentMethod === 'COD' ? 'bg-yellow-100 text-yellow-800' : 'bg-indigo-100 text-indigo-800'
                            }`}>
                              {o.paymentMethod || 'RAZORPAY'}
                            </span>
                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                              o.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {o.paymentStatus || (o.paymentMethod === 'COD' ? 'PENDING' : 'PAID')}
                            </span>
                          </div>
                        </td>
                        <td className="p-6" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={o.status}
                            onChange={(e) => updateStatus(o.id, e.target.value)}
                            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest outline-none cursor-pointer text-center appearance-none ${
                              o.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
                              o.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                              o.status === 'DELIVERED' ? 'bg-green-100 text-green-800 border border-green-200' :
                              'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                        <td className="p-6 text-right font-black text-lg text-gray-900">
                          ₹{o.totalAmount.toLocaleString()}
                        </td>
                        <td className="p-6 text-right text-gray-400">
                          <button className="text-[#98202E] font-bold text-sm hover:underline">View</button>
                        </td>
                      </tr>
                    </React.Fragment>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Modal Header */}
            <div className="px-4 py-5 sm:px-8 sm:py-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 relative">
              <div className="pr-12">
                <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-gray-900">Order Details</h2>
                <div className="flex flex-wrap gap-x-2 gap-y-1 items-center mt-1">
                  <p className="text-gray-500 font-mono text-xs sm:text-sm">#{selectedOrder.id}</p>
                  <span className="text-gray-300 hidden sm:inline">•</span>
                  <p className="text-gray-500 text-xs sm:text-sm">{new Date(selectedOrder.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
              </div>
              <div className="w-full sm:w-auto mt-2 sm:mt-0">
                <a 
                  href={`/admin/orders/${selectedOrder.id}/invoice`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-[#0a0a0a] text-white px-5 py-2.5 rounded-xl font-bold tracking-wide hover:bg-gray-800 transition-colors shadow-lg shadow-black/10 flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
                >
                  📄 Download Invoice
                </a>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors focus:outline-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Customer Box */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Customer</h3>
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 h-full">
                    <p className="font-bold text-gray-900 text-lg line-clamp-1" title={selectedOrder.customerName || selectedOrder.user?.name || 'Anonymous'}>
                      {selectedOrder.customerName || selectedOrder.user?.name || 'Anonymous'}
                    </p>
                    <p className="text-gray-600 mt-1 truncate" title={selectedOrder.customerEmail || selectedOrder.user?.email || 'No email provided'}>
                      {selectedOrder.customerEmail || selectedOrder.user?.email || 'No email provided'}
                    </p>
                    {selectedOrder.customerPhone && <p className="text-gray-600 mt-1 truncate">📞 {selectedOrder.customerPhone}</p>}
                  </div>
                </div>

                {/* Shipping Box */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Shipping Address</h3>
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 h-full">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm line-clamp-4" title={selectedOrder.shippingAddress || 'No shipping address provided.'}>
                      {selectedOrder.shippingAddress || 'No shipping address provided.'}
                    </p>
                  </div>
                </div>
                
                {/* Payment Box */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Payment Info</h3>
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 h-full flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                        selectedOrder.paymentMethod === 'COD' ? 'bg-yellow-100 text-yellow-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {selectedOrder.paymentMethod || 'RAZORPAY'}
                      </span>
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                        selectedOrder.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedOrder.paymentStatus || (selectedOrder.paymentMethod === 'COD' ? 'PENDING' : 'PAID')}
                      </span>
                    </div>

                    {selectedOrder.paymentMethod !== 'COD' && selectedOrder.razorpayOrderId && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">RZP Order ID</p>
                        <p className="text-xs font-mono text-gray-700 truncate" title={selectedOrder.razorpayOrderId}>{selectedOrder.razorpayOrderId}</p>
                      </div>
                    )}
                    
                    {selectedOrder.paymentMethod !== 'COD' && selectedOrder.razorpayPaymentId && (
                      <div className="mt-1 pt-1">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">RZP Payment ID</p>
                        <p className="text-xs font-mono text-gray-700 truncate" title={selectedOrder.razorpayPaymentId}>{selectedOrder.razorpayPaymentId}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tracking Number */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Shipment Tracking</h3>
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Enter tracking number (e.g. DTDC1234567890)"
                    value={trackingInput}
                    onChange={e => setTrackingInput(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#98202E]"
                  />
                  <button
                    onClick={saveTracking}
                    disabled={savingTracking}
                    className="px-6 py-3 bg-[#98202E] text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-[#7a1a25] transition-colors disabled:opacity-50 shrink-0"
                  >
                    {savingTracking ? "Saving..." : "Save Tracking"}
                  </button>
                </div>
                {selectedOrder.trackingNumber && (
                  <p className="text-xs text-green-600 font-bold mt-2 ml-1">✓ Currently saved: {selectedOrder.trackingNumber}</p>
                )}
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex justify-between items-end">
                  <span>Purchased Items</span>
                  <span className="bg-[#98202E]/10 text-[#98202E] px-2 py-1 rounded text-[10px] font-black tracking-widest">
                    {selectedOrder.items?.length || 0} ITEMS
                  </span>
                </h3>
                
                <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
                  {selectedOrder.items?.map((item: any, index: number) => (
                    <div key={index} className="flex gap-3 sm:gap-4 items-center p-3 sm:p-4 bg-white hover:bg-gray-50 transition-colors">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200 shadow-sm">
                        {item.product?.image ? (
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px] sm:text-xs">No Img</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{item.product?.name || 'Unknown Product'}</p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">₹{item.price.toLocaleString()} × {item.quantity}</p>
                      </div>
                      <div className="font-black text-gray-900 text-base sm:text-lg shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex justify-end items-center">
              <div className="w-full max-w-sm">
                <div className="flex justify-between py-2 text-gray-600 text-sm">
                  <span className="font-bold">Subtotal</span>
                  <span>₹{selectedOrder.items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
                </div>
                
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between py-2 text-green-600 text-sm">
                    <span className="font-bold flex items-center gap-2">
                      Discount 
                      {selectedOrder.promoCode && <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded uppercase">{selectedOrder.promoCode}</span>}
                    </span>
                    <span className="font-bold">-₹{selectedOrder.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between py-3 mt-2 border-t border-gray-200">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center">
                    {selectedOrder.paymentMethod === 'COD' && selectedOrder.paymentStatus !== 'PAID' ? 'Amount to Collect' : 'Total Paid'}
                  </span>
                  <span className="text-3xl font-black text-gray-900 tracking-tight">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
