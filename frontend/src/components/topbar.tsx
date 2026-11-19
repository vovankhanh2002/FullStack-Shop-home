import Link from "next/link";
import { Sparkles, Truck, PhoneCall, ShieldCheck } from "lucide-react";

export function Topbar() {
  return (
    <div className="bg-wood-600 text-white text-[12px] py-1.5 px-4 tracking-wide">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <Truck className="w-3.5 h-3.5 text-wood-200" />
            <span>Miễn phí vận chuyển & giao lắp đơn từ 1.000.000đ</span>
          </span>
          <span className="hidden lg:inline-block text-wood-300">|</span>
          <span className="hidden lg:flex items-center gap-1.5 text-wood-100">
            <ShieldCheck className="w-3.5 h-3.5 text-wood-200" />
            <span>Bảo hành nệm tới 10 năm & Ngủ thử 30 đêm</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-wood-100">
          <Link href="/lookbook" className="hover:text-white transition-colors flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Lookbook phòng ngủ</span>
          </Link>
          <span className="text-wood-300">|</span>
          <a href="tel:19008888" className="hover:text-white transition-colors flex items-center gap-1">
            <PhoneCall className="w-3 h-3" />
            <span>Hotline: 1900 8888</span>
          </a>
        </div>
      </div>
    </div>
  );
}
