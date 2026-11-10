"use client";

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginForm({
  onSuccess,
  onSwitchToRegister,
}: LoginFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">
          เข้าสู่ระบบ sarapatrabchang
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          ยินดีต้อนรับกลับมา กรุณากรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งาน
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
          อีเมล หรือ เบอร์โทรศัพท์
        </label>
        <input
          type="text"
          required
          placeholder="example@email.com หรือ 08X-XXX-XXXX"
          defaultValue="pimchanok@example.com"
          className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-zinc-700">
            รหัสผ่าน
          </label>
          <a href="#forgot" className="text-xs text-orange-600 hover:underline">
            ลืมรหัสผ่าน?
          </a>
        </div>
        <input
          type="password"
          required
          placeholder="กรอกรหัสผ่านของคุณ"
          defaultValue="••••••••"
          className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3.5 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
      >
        เข้าสู่ระบบ
      </button>

      <div className="text-center pt-2">
        <span className="text-xs text-zinc-500">
          ยังไม่มีบัญชีใช่หรือไม่?{" "}
        </span>
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-xs font-semibold text-orange-600 hover:text-orange-700 underline cursor-pointer"
        >
          สมัครสมาชิกใหม่
        </button>
      </div>
    </form>
  );
}

