export default function PrivacyInfoCard() {
  return (
    <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-5 space-y-3">
      <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-orange-500" />
        ใครเห็นข้อมูลอะไรบ้าง?
      </h4>
      <div className="space-y-2 text-xs">
        <div>
          <span className="font-semibold text-zinc-800">สาธารณะ: </span>
          <span className="text-zinc-600">รูป, ชื่อ, ประเภทผู้ใช้, คำแนะนำตัว, และความคิดเห็น/รีวิว</span>
        </div>
        <div>
          <span className="font-semibold text-zinc-800">เฉพาะคุณ: </span>
          <span className="text-zinc-600">ความสนใจ, อีเมล, เบอร์โทร, ที่อยู่, และข้อมูลใบกำกับภาษี</span>
        </div>
      </div>
    </div>
  );
}

