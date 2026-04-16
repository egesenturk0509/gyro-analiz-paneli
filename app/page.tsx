"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Login } from '../Login';
import { Sidebar } from '../Sidebar';
import { Dashboard } from '../Dashboard';

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
      <Login
        handleLogin={handleLogin}
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        loginStatus={loginStatus}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-black font-sans relative flex">
      <Sidebar
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        gyros={gyros}
        activeGyroId={activeGyroId}
        setActiveGyroId={setActiveGyroId}
        updateGyroName={updateGyroName}
        toggleEditMode={toggleEditMode}
        deleteGyro={deleteGyro}
        addGyro={addGyro}
      />
      <Dashboard
        activeGyro={activeGyro}
        setIsMenuOpen={setIsMenuOpen}
        isConnected={isConnected}
        connectSerial={connectSerial}
        handleLogout={handleLogout}
        gyroData={gyroData}
        alertBox={alertBox}
        history={history}
        scrollRef={scrollRef}
        clearHistory={() => { setHistory([]); counterRef.current = 0; }}
      />
    </div>
  );
}