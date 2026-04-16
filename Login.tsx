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
          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-5 rounded-full shadow-lg">
            Giriş
          </button>
        </form>
      </div>
    </div>
  );
};