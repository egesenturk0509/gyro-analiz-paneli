import React from 'react';

interface HistoryItem {
  time: string;
  data: string;
  id: number;
  uid: string;
}

interface DashboardProps {
  activeGyro: { id: number; name: string } | undefined;
  setIsMenuOpen: (val: boolean) => void;
  isConnected: boolean;
  connectSerial: () => void;
  handleLogout: () => void;
  gyroData: { yon: string; derece: number };
  alertBox: { bg: string; text: string; opacity: string };
  history: HistoryItem[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
  clearHistory: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  activeGyro,
  setIsMenuOpen,
  isConnected,
  connectSerial,
  handleLogout,
  gyroData,
  alertBox,
  history,
  scrollRef,
  clearHistory,
}) => {
  return (
    <div className="flex-1 p-6 md:p-10 h-screen overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 relative">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden absolute left-0 top-0 p-2 text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <h1 className="text-4xl font-black tracking-tight text-slate-900 mt-10 md:mt-0 text-center md:text-left">
            <span className="text-blue-500">{activeGyro?.name}</span> Analiz Ekranı
          </h1>

          <div className="flex gap-3">
            <button onClick={connectSerial} className={`px-8 py-3 rounded-2xl font-bold transition-all shadow-md border-0 ${isConnected ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
              {isConnected ? "Kapat" : "Bağlan"}
            </button>
            <button onClick={handleLogout} className="bg-slate-200 text-slate-700 px-8 py-3 rounded-2xl font-bold hover:bg-slate-300 transition-colors shadow-sm border-0">Çıkış</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-10 rounded-[30px] text-center shadow-lg border border-slate-100">
            <span className="text-slate-400 font-bold tracking-widest uppercase text-sm">Hareket Yönü</span>
            <div className="text-6xl font-black mt-4 tracking-tight text-slate-800">{gyroData.yon}</div>
          </div>
          <div className="bg-white p-10 rounded-[30px] text-center shadow-lg border border-slate-100">
            <span className="text-slate-400 font-bold tracking-widest uppercase text-sm">Şiddet Derecesi</span>
            <div className="text-6xl font-mono font-bold mt-4 text-blue-600">{gyroData.derece.toFixed(2)}°</div>
          </div>

          <div className={`md:col-span-2 p-8 rounded-[30px] text-center transition-all duration-500 min-h-[100px] flex items-center justify-center shadow-lg ${alertBox.bg} ${alertBox.opacity}`}>
            <div className="text-white text-4xl font-black tracking-wide drop-shadow-md">
              {alertBox.text}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[30px] shadow-lg h-[400px] overflow-hidden flex flex-col border border-slate-100">
          <div className="px-8 py-5 border-b border-slate-100 flex justify-between bg-slate-50 items-center">
            <div className="flex gap-12 font-bold text-slate-500 text-sm">
              <span className="w-12">No</span>
              <span className="w-56">Tarih Ve Saat</span>
              <span>{activeGyro?.name} Verisi</span>
            </div>
            <button onClick={clearHistory} className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-colors px-6 py-2 rounded-xl text-xs font-bold shadow-sm border-0">Geçmişi Sil</button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-4 font-mono text-[14px]">
            {history.map((item) => (
              <div key={item.uid} className="flex gap-12 border-b border-slate-50 py-3 hover:bg-slate-50 transition-colors">
                <span className="w-12 text-slate-400 font-bold">{item.id}</span>
                <span className="w-56 text-blue-600 font-bold">{item.time}</span>
                <span className="font-black text-slate-800">{item.data}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};