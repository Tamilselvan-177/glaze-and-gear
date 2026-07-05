"use client";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isGearsPage = pathname === "/gears";

  // Dynamic Styling based on the page
  const footerBg = isGearsPage ? "bg-[#0a0a0a] border-t border-white/10" : "bg-[#98202E]";
  const textColor = isGearsPage ? "text-[#888]" : "text-white/70";
  const headingColor = isGearsPage ? "text-white" : "text-white";
  const hoverColor = isGearsPage ? "hover:text-white" : "hover:text-white";

  return (
    <footer className={`${footerBg} py-16 px-[5%] text-center transition-colors duration-500`}>
      <div className={`font-serif text-4xl font-black mb-8 ${headingColor} tracking-wide`}>
        Glaze & Gear
      </div>
      
      <div className="flex justify-center gap-8 md:gap-12 mb-12">
        <a 
          href="https://www.instagram.com/glaze.and.gear?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
          target="_blank" 
          rel="noopener noreferrer"
          className={`text-xs md:text-sm font-bold uppercase tracking-[3px] ${textColor} ${hoverColor} transition-all hover:-translate-y-1`}
        >
          Instagram
        </a>
        <a 
          // Add your WhatsApp number after the slash below (e.g., https://wa.me/919876543210)
          href="https://wa.me/" 
          target="_blank" 
          rel="noopener noreferrer"
          className={`text-xs md:text-sm font-bold uppercase tracking-[3px] ${textColor} ${hoverColor} transition-all hover:-translate-y-1`}
        >
          WhatsApp
        </a>
      </div>
      
      <p className={`text-[10px] md:text-xs uppercase tracking-[3px] ${textColor}`}>
        &copy; 2026 Glaze & Gear. All rights reserved.
      </p>
    </footer>
  );
}