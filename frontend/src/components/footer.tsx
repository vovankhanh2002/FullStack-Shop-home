import Link from "next/link";
import { ShieldCheck, Moon, Truck, CreditCard, Mail, Phone, MapPin, Heart } from "lucide-react";

export function Footer() {
  const commitments = [
    {
      icon: ShieldCheck,
      title: "Bảo hành tới 10 năm",
      desc: "Cam kết 100% chính hãng, đổi mới nệm nếu xẹp lún",
    },
    {
      icon: Moon,
      title: "30 Đêm ngủ thử",
      desc: "Trải nghiệm thực tế tại nhà, đổi trả dễ dàng",
    },
    {
      icon: Truck,
      title: "Giao & Lắp tận phòng",
      desc: "Miễn phí vận chuyển cho đơn hàng từ 1.000.000đ",
    },
    {
      icon: CreditCard,
      title: "Trả góp 0% lãi suất",
      desc: "Thanh toán linh hoạt qua thẻ tín dụng và VietQR",
    },
  ];

  return (
    <footer className="bg-cream-100 text-charcoal-700 border-t border-cream-200 mt-20">
      {/* 4 Brand Commitments */}
      <div className="border-b border-cream-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {commitments.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-start gap-3.5 p-3 rounded-2xl hover:bg-cream-50 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-wood-50 text-wood-600 flex items-center justify-center flex-shrink-0 border border-wood-200">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-bold text-charcoal-900">{item.title}</h4>
                  <p className="text-[11px] text-charcoal-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-xs">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="inline-block">
            <span className="font-serif text-2xl font-bold text-wood-600">
              Shop<span className="text-charcoal-900 font-sans italic font-normal">Home</span>
            </span>
            <span className="block text-[10px] uppercase tracking-[0.25em] text-charcoal-500 font-sans font-medium">
              Bedding & Decor
            </span>
          </Link>
          <p className="text-charcoal-600 leading-relaxed max-w-sm">
            ShopHome là thương hiệu tiên phong mang đến không gian phòng ngủ chuẩn Scandinavian: êm ái, tối giản và ấm áp. Chúng tôi chăm chút từng đường may sợi vải Tencel để bạn có giấc ngủ trọn vẹn nhất.
          </p>
          <div className="space-y-2 text-charcoal-600">
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-wood-600 flex-shrink-0" />
              <span>Showroom HN: Vincom Mega Mall Smart City, Hà Nội</span>
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-wood-600 flex-shrink-0" />
              <span>Showroom HCM: 123 Song Hành, P. An Phú, TP. Thủ Đức</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-wood-600 flex-shrink-0" />
              <span>Hotline CSKH: 1900 8888 (8h30 - 21h30)</span>
            </p>
          </div>
        </div>

        {/* Collections */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">Danh mục sản phẩm</h4>
          <ul className="space-y-2 text-charcoal-600">
            <li><Link href="/products?category=chan-ga-goi" className="hover:text-wood-600 transition-colors">Chăn ga Tencel 60s</Link></li>
            <li><Link href="/products?category=chan-ga-goi" className="hover:text-wood-600 transition-colors">Ga giường Cotton Satin</Link></li>
            <li><Link href="/products?category=nem-ngu" className="hover:text-wood-600 transition-colors">Nệm cao su thiên nhiên</Link></li>
            <li><Link href="/products?category=nem-ngu" className="hover:text-wood-600 transition-colors">Nệm lò xo túi độc lập</Link></li>
            <li><Link href="/products?category=goi-ruot-chan" className="hover:text-wood-600 transition-colors">Gối công thái học</Link></li>
            <li><Link href="/products?category=giuong-ngu" className="hover:text-wood-600 transition-colors">Giường gỗ sồi Bắc Âu</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">Hỗ trợ khách hàng</h4>
          <ul className="space-y-2 text-charcoal-600">
            <li><Link href="/lookbook" className="hover:text-wood-600 transition-colors">Lookbook Mua theo không gian</Link></li>
            <li><span className="hover:text-wood-600 transition-colors cursor-pointer">Chính sách 30 đêm ngủ thử</span></li>
            <li><span className="hover:text-wood-600 transition-colors cursor-pointer">Hướng dẫn bảo quản & giặt ủi</span></li>
            <li><span className="hover:text-wood-600 transition-colors cursor-pointer">Chính sách giao hàng & lắp đặt</span></li>
            <li><span className="hover:text-wood-600 transition-colors cursor-pointer">Quy định đổi trả và bảo hành</span></li>
            <li><Link href="/checkout" className="hover:text-wood-600 transition-colors">Tra cứu đơn hàng</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">Ưu đãi & Bản tin</h4>
          <p className="text-charcoal-600 leading-relaxed text-[11px]">
            Đăng ký email nhận ngay voucher <strong className="text-wood-600">HOMEWELCOME (-10%)</strong> cho đơn hàng đầu tiên.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Email của bạn..."
              className="flex-1 px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl focus:outline-none focus:border-wood-500"
            />
            <button className="px-3.5 py-2 bg-wood-600 hover:bg-wood-700 text-white font-semibold rounded-xl transition-colors">
              Gửi
            </button>
          </div>
          <div className="pt-2">
            <p className="text-[11px] text-charcoal-500">Thanh toán an toàn:</p>
            <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-charcoal-600">
              <span className="px-2 py-0.5 bg-white border border-cream-200 rounded">VietQR</span>
              <span className="px-2 py-0.5 bg-white border border-cream-200 rounded">COD</span>
              <span className="px-2 py-0.5 bg-white border border-cream-200 rounded">ATM / Visa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-cream-200 py-4 bg-cream-200/50 text-center text-[11px] text-charcoal-500">
        <p>© 2026 ShopHome Bedding & Decor. All rights reserved. Thiết kế với trọn vẹn yêu thương cho giấc ngủ gia đình.</p>
      </div>
    </footer>
  );
}
