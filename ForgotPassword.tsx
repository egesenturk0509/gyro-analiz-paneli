import React, { useState } from 'react';

interface ForgotPasswordProps {
  onSwitchView: (view: 'login') => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onSwitchView }) => {
  const [email, setEmail] = useState('');

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`${email} adresine şifre sıfırlama maili gönderildi! (Simüle edildi)`);
    onSwitchView('login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-black">
      <div className="bg-white w-full max-w-md p-10 rounded-[40px] shadow-2xl border-none">
        <h1 className="text-2xl font-black text-center mb-10">Şifremi Unuttum</h1>
        <p className="text-slate-500 text-center mb-8 font-medium">E-posta adresini gir, sana bir sıfırlama bağlantısı gönderelim.</p>
        <form onSubmit={handleReset} className="space-y-6">
          <input
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-50 border rounded-2xl px-6 py-4"
            required
          />
          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-5 rounded-full shadow-lg">
            Sıfırlama Maili Gönder
          </button>
          <div className="text-center">
            <button type="button" onClick={() => onSwitchView('login')} className="text-sm font-bold text-slate-500 hover:text-slate-800">Vazgeç ve Geri Dön</button>
          </div>
        </form>
      </div>
    </div>
  );
};