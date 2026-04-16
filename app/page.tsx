"use client";
import React, { useState, useEffect, useRef } from 'react';

export default function GyroAnalizPaneli() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState({ type: '', message: '' });

  // --- GELİŞMİŞ MENÜ VE CİHAZ YÖNETİMİ STATELERİ ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [gyros, setGyros] = useState([{ id: 1, name: '1. Gyro', isEditing: false }]);
  const [activeGyroId, setActiveGyroId] = useState(1); // Hangi ekranın açık olduğunu tutar

  const [isConnected, setIsConnected] = useState(false);
  const [gyroData, setGyroData] = useState({ yon: 'Stabil', derece: 0 });
  const [history, setHistory] = useState<{time: string, data: string, id: number, uid: string}[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef(0);
  const portRef = useRef<any>(null);
  const readerRef = useRef<any>(null);
  const keepReading = useRef(true);

  const getFullTimestamp = () => {
    const now = new Date();
    const date = now.toLocaleDateString('tr-TR');
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    return `${date} - ${h}:${m}:${s}.${ms}`;
  };

  useEffect(() => {
    setMounted(true);
    document.title = "Gyro Analiz Paneli";
    const savedLogin = localStorage.getItem('gyro_isLoggedIn');
    if (savedLogin === 'true') setIsLoggedIn(true);
    return () => { if (portRef.current) disconnectSerial(); };
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
      if (isAtBottom) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [history]); 

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'deprem.sensoru' && password === '1234') {
      setIsLoggedIn(true);
      localStorage.setItem('gyro_isLoggedIn', 'true');
    } else {
      setLoginStatus({ type: 'error', message: '❌ Hatalı Giriş!' });
    }
  };

  const handleLogout = async () => {
    await disconnectSerial();
    setIsLoggedIn(false);
    localStorage.removeItem('gyro_isLoggedIn');
  };

  const disconnectSerial = async () => {
    keepReading.current = false;
    if (readerRef.current) {
      try { await readerRef.current.cancel(); readerRef.current.releaseLock(); } catch (e) {}
    }
    if (portRef.current) {
      try { await portRef.current.close(); } catch (e) {}
    }
    setIsConnected(false);
    setGyroData({ yon: 'Stabil', derece: 0 });
  };

  const connectSerial = async () => {
    if (isConnected) { await disconnectSerial(); return; }
    if (history.length === 0) { counterRef.current = 0; }

    try {
      // @ts-ignore
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      portRef.current = port;
      setIsConnected(true);
      keepReading.current = true;
      const reader = port.readable.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let partialLine = "";

      while (keepReading.current) {
        const { value, done } = await reader.read();
        if (done) break;
        partialLine += decoder.decode(value, { stream: true });
        const lines = partialLine.split('\n');
        partialLine = lines.pop() || "";

        for (const line of lines) {
          const cleanValue = line.trim();
          if (!cleanValue) continue;
          
          const yonMatch = cleanValue.match(/Yon:\s*(\w+)/);
          const dereceMatch = cleanValue.match(/Derece:\s*([\d.]+)/);

          if (yonMatch && dereceMatch) {
            let rawYon = yonMatch[1].toLowerCase();
            let formatliYon = rawYon === "ileri" ? "İleri" : rawYon.charAt(0).toLocaleUpperCase('tr-TR') + rawYon.slice(1);
            setGyroData({ yon: formatliYon, derece: parseFloat(dereceMatch[1]) });
            
            counterRef.current += 1;
            const uniqueId = `${Date.now()}-${counterRef.current}-${Math.random().toString(36).substring(2, 9)}`;
            
            setHistory(prev => [...prev, { time: getFullTimestamp(), data: cleanValue, id: counterRef.current, uid: uniqueId }].slice(-100));
          }
        }
      }
    } catch (e) { setIsConnected(false); }
  };

  // --- CİHAZ YÖNETİM FONKSİYONLARI ---
  const addGyro = () => {
    const newId = Date.now(); // Benzersiz ID oluştur
    const newNumber = gyros.length + 1;
    setGyros([...gyros, { id: newId, name: `${newNumber}. Gyro`, isEditing: false }]);
    setActiveGyroId(newId); // Eklenen cihaza otomatik geçiş yap
  };

  const deleteGyro = (id: number) => {
    if (gyros.length <= 1) {
      alert("En az 1 cihaz kalmalıdır!");
      return;
    }
    const filteredGyros = gyros.filter(g => g.id !== id);
    setGyros(filteredGyros);
    // Eğer silinen cihaz şu an ekranda açıksa, listedeki ilk cihaza geç
    if (activeGyroId === id) {
      setActiveGyroId(filteredGyros[0].id);
    }
  };

  const toggleEditMode = (id: number) => {
    setGyros(gyros.map(g => g.id === id ? { ...g, isEditing: !g.isEditing } : g));
  };

  const updateGyroName = (id: number, newName: string) => {
    setGyros(gyros.map(g => g.id === id ? { ...g, name: newName } : g));
  };

  // Aktif (Ekranda Açık Olan) Cihazı Bul
  const activeGyro = gyros.find(g => g.id === activeGyroId) || gyros[0];
  // -----------------------------------

  const getAlertStyle = () => {
    const d = gyroData.derece;
    if (d >= 3) return { bg: 'bg-red-600', text: '⚠️ Acil Tahliye ⚠️', opacity: 'opacity-100 scale-100' };
    if (d >= 2) return { bg: 'bg-orange-500', text: 'Tehlike!', opacity: 'opacity-100 scale-100' };
    if (d >= 1) return { bg: 'bg-yellow-400', text: 'Dikkat!', opacity: 'opacity-100 scale-100' };
    return { bg: 'bg-transparent', text: '', opacity: 'opacity-0 scale-95' };
  };

  const alertBox = getAlertStyle();

  if (!mounted) return null;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-black">
        <div className="bg-white w-full max-w-md p-10 rounded-[40px] shadow-2xl border-none">
          <h1 className="text-2xl font-black text-center mb-10">Giriş Yap</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="text" placeholder="Kullanıcı" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-slate-50 border rounded-2xl px-6 py-4" />
            <div className="relative w-full rounded-2xl">
              <input type={showPassword ? "text" : "password"} placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 border rounded-2xl px-6 py-4 pr-16" />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                <div className="relative flex items-center justify-center w-10 h-10">
                  <span className="text-[30px] z-20">👁️</span>
                  <svg className={`absolute inset-0 w-full h-full z-30 transition-opacity ${showPassword ? 'opacity-100' : 'opacity-0'}`} viewBox="0 0 40 40">
                    <line x1="31" y1="9" x2="9" y2="31" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>
            {loginStatus.message && <p className="text-red-500 font-bold text-center">{loginStatus.message}</p>}
            <button type="submit" className="w-full bg-slate-900 text-white font-bold py-5 rounded-full shadow-lg">Giriş</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-black font-sans relative flex">
      
      {/* KARARTMA ARKA PLANI (Mobil İçin) */}
      <div 
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 md:hidden ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsMenuOpen(false)}
      />
      
      {/* YAN MENÜ (SIDEBAR) */}
      <div className={`fixed md:relative top-0 left-0 h-screen w-80 bg-white shadow-2xl md:shadow-none md:border-r border-slate-200 z-50 transform transition-transform duration-300 flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex justify-between items-center border-b border-slate-100 bg-slate-900 text-white">
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
            Cihazlar
          </h2>
          <button onClick={() => setIsMenuOpen(false)} className="md:hidden text-white hover:text-red-400 transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* CİHAZ LİSTESİ */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {gyros.map((gyro) => (
            <div 
              key={gyro.id} 
              onClick={() => setActiveGyroId(gyro.id)}
              className={`group p-4 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${activeGyroId === gyro.id ? 'bg-blue-50 border-blue-500 shadow-md transform scale-[1.02]' : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50'}`}
            >
              <div className="flex justify-between items-center">
                
                {/* İSİM VEYA İNPUT EKRANI */}
                <div className="flex-1 mr-2">
                  {gyro.isEditing ? (
                    <input 
                      type="text" 
                      value={gyro.name} 
                      onChange={(e) => updateGyroName(gyro.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()} // Tıklamanın cihazı seçmesini engelle
                      onKeyDown={(e) => { if(e.key === 'Enter') toggleEditMode(gyro.id); }}
                      className="w-full font-black text-lg bg-white border-2 border-blue-400 rounded-lg px-2 py-1 outline-none text-slate-800"
                      autoFocus
                    />
                  ) : (
                    <div className="font-bold text-lg text-slate-800 truncate">{gyro.name}</div>
                  )}
                  <div className={`text-xs font-bold mt-1 uppercase tracking-wider ${activeGyroId === gyro.id ? 'text-blue-500' : 'text-slate-400'}`}>
                    {activeGyroId === gyro.id ? '🟢 Ekranda Açık' : '⚪ Bekliyor'}
                  </div>
                </div>

                {/* BUTONLAR (KALEM VE ÇÖP KUTUSU) */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleEditMode(gyro.id); }} 
                    className={`p-2 rounded-lg transition-colors ${gyro.isEditing ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600'}`}
                    title={gyro.isEditing ? "Kaydet" : "İsmi Değiştir"}
                  >
                    {gyro.isEditing ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    )}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteGyro(gyro.id); }} 
                    className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors"
                    title="Cihazı Sil"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button 
            onClick={addGyro}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-md hover:bg-slate-800 transition-transform active:scale-95 flex justify-center items-center gap-2"
          >
            <span className="text-2xl">+</span> Yeni Gyro Ekle
          </button>
        </div>
      </div>
      {/* --- YAN MENÜ BİTİŞİ --- */}


      {/* --- ANA EKRAN İÇERİĞİ --- */}
      <div className="flex-1 p-6 md:p-10 h-screen overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 relative">
            
            {/* MOBİL MENÜ AÇMA BUTONU */}
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden absolute left-0 top-0 p-2 text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* SEÇİLİ CİHAZIN BAŞLIĞI */}
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

              {/* Uyarı Kutusu */}
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
              <button onClick={() => { setHistory([]); counterRef.current = 0; }} className="bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-colors px-6 py-2 rounded-xl text-xs font-bold shadow-sm border-0">Geçmişi Sil</button>
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

    </div>
  );
}