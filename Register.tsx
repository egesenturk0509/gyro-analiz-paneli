import React, { useState } from 'react';

interface RegisterProps {
  onSwitchView: (view: 'login') => void;
}

export const Register: React.FC<RegisterProps> = ({ onSwitchView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`${email} adresi ile kayıt başarılı! (Simüle edildi)`);
    onSwitchView('login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-black">
      <div className="bg-white w-full max-w-md p-10 rounded-[40px] shadow-2xl border-none">
        <h1 className="text-2xl font-black text-center mb-10">Hesap Oluştur</h1>
        <form onSubmit={handleRegister} className="space-y-6">
          <input
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-50 border rounded-2xl px-6 py-4"
            required
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-50 border rounded-2xl px-6 py-4"
            required
          />
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-5 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
            Kayıt Ol
          </button>
          <p className="text-center text-sm font-bold text-slate-500">
            Zaten hesabın var mı?{' '}
            <button type="button" onClick={() => onSwitchView('login')} className="text-blue-600 hover:underline">Giriş Yap</button>
          </p>
        </form>
      </div>
    </div>
  );
};