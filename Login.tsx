import React from 'react';

interface LoginProps {
  handleLogin: (e: React.FormEvent) => void;
  username: string;
  setUsername: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  loginStatus: { type: string; message: string };
  onSwitchView: (view: 'register' | 'forgot-password') => void;
  onSocialLogin: (provider: string) => void;
}

export const Login: React.FC<LoginProps> = ({
  handleLogin,
  username,
  setUsername,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  loginStatus,
  onSwitchView,
  onSocialLogin,
}) => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-black">
      <div className="bg-white w-full max-w-md p-10 rounded-[40px] shadow-2xl border-none">
        <h1 className="text-2xl font-black text-center mb-10">Giriş Yap</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="text"
            placeholder="Kullanıcı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-slate-50 border rounded-2xl px-6 py-4"
          />
          <div className="relative w-full rounded-2xl">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border rounded-2xl px-6 py-4 pr-16"
            />
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-4 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              <div className="relative flex items-center justify-center w-10 h-10">
                <span className="text-[30px] z-20">👁️</span>
                <svg
                  className={`absolute inset-0 w-full h-full z-30 transition-opacity ${
                    showPassword ? 'opacity-100' : 'opacity-0'
                  }`}
                  viewBox="0 0 40 40"
                >
                  <line x1="31" y1="9" x2="9" y2="31" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
          {loginStatus.message && (
            <p className="text-red-500 font-bold text-center">{loginStatus.message}</p>
          )}
          <div className="flex justify-between text-sm font-bold text-slate-500 px-2">
            <button type="button" onClick={() => onSwitchView('forgot-password')} className="hover:text-slate-800">Şifremi Unuttum</button>
            <button type="button" onClick={() => onSwitchView('register')} className="hover:text-slate-800">Hesap Oluştur</button>
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-5 rounded-full shadow-lg">
            Giriş
          </button>

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase">Veya şununla devam et</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => onSocialLogin('Google')} className="flex items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-2xl hover:bg-slate-50 transition-colors font-bold text-sm">
              <span className="text-lg">G</span> Google
            </button>
            <button type="button" onClick={() => onSocialLogin('GitHub')} className="flex items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-2xl hover:bg-slate-50 transition-colors font-bold text-sm">
              <span className="text-lg">🐙</span> GitHub
            </button>
            <button type="button" onClick={() => onSocialLogin('X')} className="flex items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-2xl hover:bg-slate-50 transition-colors font-bold text-sm">
              <span className="text-lg">𝕏</span> X
            </button>
            <button type="button" onClick={() => onSocialLogin('Yahoo')} className="flex items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-2xl hover:bg-slate-50 transition-colors font-bold text-sm">
              <span className="text-lg">!</span> Yahoo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};