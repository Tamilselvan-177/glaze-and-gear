"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ProductDetailClient({ slug }: { slug: string }) {
  const { data: session, status } = useSession();
  const [product, setProduct] = useState<any>(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const router = useRouter();

  const fetchProduct = () => {
    if (slug) {
      fetch(`/api/products/${slug}`)
        .then(res => {
          if (!res.ok) throw new Error('Product not found');
          return res.json();
        })
        .then(data => {
          setProduct(data);
          if (status === "authenticated") {
            fetch('/api/wishlist')
              .then(res => res.json())
              .then(wishlist => {
                if (Array.isArray(wishlist)) {
                  setInWishlist(wishlist.some(item => item.productId === data.id));
                }
              })
              .catch(console.error);
          }
        })
        .catch(err => console.error(err));
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [slug, status]);

  const addToCart = async () => {
    if (!product) return;
    if (status === "unauthenticated" || !session) {
      router.push("/login");
      return;
    }

    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 })
      });
      window.dispatchEvent(new Event('cartUpdated'));
      alert('Product added to cart!');
    } catch (err) {
      alert("Failed to add to cart.");
    }
  };

  const buyNow = async () => {
    if (!product) return;
    if (status === "unauthenticated" || !session) {
      router.push("/login");
      return;
    }

    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 })
      });
      window.dispatchEvent(new Event('cartUpdated'));
      router.push("/cart");
    } catch (err) {
      alert("Failed to proceed.");
    }
  };

  const toggleWishlist = async () => {
    if (!product) return;
    if (status === "unauthenticated" || !session) {
      router.push("/login");
      return;
    }

    const previousState = inWishlist;
    setInWishlist(!inWishlist);

    try {
      if (previousState) {
        await fetch(`/api/wishlist?productId=${product.id}`, { method: 'DELETE' });
      } else {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id })
        });
      }
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      console.error(err);
      setInWishlist(previousState);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "unauthenticated" || !session) {
      router.push("/login");
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })
      });
      if (res.ok) {
        setReviewForm({ rating: 5, comment: "" });
        fetchProduct(); // Refresh reviews
        alert("Review submitted successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit review.");
      }
    } catch (err) {
      alert("An error occurred.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!product) return (
    <div className="pt-[150px] pb-[100px] px-[5%] max-w-[1200px] mx-auto min-h-screen grid grid-cols-1 md:grid-cols-2 gap-16 items-center animate-pulse">
      <div className="w-full aspect-square rounded-[20px] bg-gray-200"></div>
      <div>
        <div className="h-4 w-1/4 bg-gray-200 rounded mb-6"></div>
        <div className="h-14 w-3/4 bg-gray-200 rounded mb-6"></div>
        <div className="h-8 w-1/3 bg-gray-200 rounded mb-10"></div>
        <div className="h-4 w-full bg-gray-200 rounded mb-3"></div>
      </div>
    </div>
  );

  const averageRating = product.reviews?.length 
    ? (product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
    : "No reviews yet";

  return (
    <div className="pt-[150px] pb-[100px] px-[5%] max-w-[1200px] mx-auto min-h-screen flex flex-col gap-16">
      
      {/* Product Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="w-full aspect-square rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(152,32,46,0.15)] relative">
          <button 
            onClick={toggleWishlist}
            className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full shadow-sm flex items-center justify-center transition-transform hover:scale-110 text-xl"
          >
            {inWishlist ? "❤️" : "🤍"}
          </button>
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[3px] opacity-70 mb-4 text-[#98202E]">{product.category}</p>
          <h1 className="text-4xl md:text-6xl font-serif text-[#98202E] mb-4 leading-tight">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-yellow-400 text-xl">★</span>
            <span className="text-gray-600 font-bold">{averageRating}</span>
            <span className="text-gray-400 text-sm">({product.reviews?.length || 0} reviews)</span>
          </div>
          <p className="text-3xl font-extrabold text-[#D09399] mb-8">₹{product.price.toLocaleString('en-IN')}</p>
          <p className="text-lg opacity-90 mb-8 text-[#98202E] leading-relaxed">{product.description}</p>
          
          <div className="flex flex-wrap gap-4">
            <button onClick={buyNow} className="flex-1 min-w-[200px] py-4 px-8 bg-[#98202E] text-white font-bold text-sm uppercase tracking-widest rounded hover:opacity-80 hover:-translate-y-1 transition-all">
              Buy Now
            </button>
            <button onClick={addToCart} className="flex-1 min-w-[200px] py-4 px-8 bg-transparent border-2 border-[#98202E] text-[#98202E] font-bold text-sm uppercase tracking-widest rounded hover:opacity-80 hover:-translate-y-1 transition-all">
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-[#98202E]/20 pt-16 mt-8">
        <h2 className="text-3xl font-serif text-[#98202E] mb-12">Customer Reviews</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Write a Review Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#98202E]/10">
              <h3 className="text-xl font-serif text-[#98202E] mb-6">Write a Review</h3>
              {status === "authenticated" ? (
                <form onSubmit={submitReview} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Rating</label>
                    <select 
                      value={reviewForm.rating}
                      onChange={e => setReviewForm({...reviewForm, rating: Number(e.target.value)})}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#98202E]"
                    >
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Very Good</option>
                      <option value="3">3 - Average</option>
                      <option value="2">2 - Poor</option>
                      <option value="1">1 - Terrible</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-widest mb-2">Comment</label>
                    <textarea 
                      required
                      placeholder="Share your thoughts about this product..."
                      value={reviewForm.comment}
                      onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#98202E] min-h-[120px]"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={submittingReview}
                    className="w-full mt-2 bg-[#98202E] text-white py-4 rounded-xl font-bold tracking-widest uppercase hover:bg-[#7a1a25] transition-all disabled:opacity-50"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Please login to write a review.</p>
                  <button onClick={() => router.push('/login')} className="bg-[#98202E] text-white px-6 py-2 rounded font-bold uppercase tracking-widest text-sm hover:bg-[#7a1a25] transition-colors">
                    Login
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((review: any) => (
                <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#98202E] text-white rounded-full flex items-center justify-center font-bold uppercase">
                        {review.user?.name ? review.user.name.charAt(0) : "U"}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{review.user?.name || "Anonymous User"}</p>
                        <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex text-yellow-400 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-200"}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 mt-2">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 italic">No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
