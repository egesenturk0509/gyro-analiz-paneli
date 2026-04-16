import React from 'react';

interface Gyro {
  id: number;
  name: string;
  isEditing: boolean;
}

interface SidebarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (val: boolean) => void;
  gyros: Gyro[];
  activeGyroId: number;
  setActiveGyroId: (id: number) => void;
  updateGyroName: (id: number, name: string) => void;
  toggleEditMode: (id: number) => void;
  deleteGyro: (id: number) => void;
  addGyro: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMenuOpen,
  setIsMenuOpen,
  gyros,
  activeGyroId,
  setActiveGyroId,
  updateGyroName,
  toggleEditMode,
  deleteGyro,
  addGyro,
}) => {
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 md:hidden ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsMenuOpen(false)}
      />
      
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
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {gyros.map((gyro) => (
            <div 
              key={gyro.id} 
              onClick={() => setActiveGyroId(gyro.id)}
              className={`group p-4 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${activeGyroId === gyro.id ? 'bg-blue-50 border-blue-500 shadow-md transform scale-[1.02]' : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50'}`}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1 mr-2">
                  {gyro.isEditing ? (
                    <input 
                      type="text" 
                      value={gyro.name} 
                      onChange={(e) => updateGyroName(gyro.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
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
    </>
  );
};