import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto bg-white border-t border-zinc-200 py-6 text-xs text-zinc-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span>© 2569 </span>
          <span className="font-semibold text-zinc-800">sarapatrabchang</span>
          <span> • บริการใกล้บ้าน อุ่นใจทุกงาน</span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="#help"
            className="hover:text-orange-600 transition-colors"
          >
            ศูนย์ช่วยเหลือ
          </Link>
          <Link
            href="#terms"
            className="hover:text-orange-600 transition-colors"
          >
            ข้อกำหนดการใช้งาน
          </Link>
          <Link
            href="#privacy"
            className="hover:text-orange-600 transition-colors"
          >
            นโยบายความเป็นส่วนตัว
          </Link>
        </div>
      </div>
    </footer>
  );
}

