
import React, { useState, useEffect, useMemo } from 'react';
import { PillarType, Goal, Habit, ViewType, AppSettings, Pillar } from './types';
import { PILLARS as DEFAULT_PILLARS, INITIAL_GOALS, INITIAL_HABITS } from './constants';
import { getDailyWisdom } from './services/gemini';

const THEMES = {
  gold: { primary: '#d4af37', bg: '#f4e4bc', text: '#2c2416' },
  night: { primary: '#6366f1', bg: '#0f172a', text: '#f1f5f9' },
  oasis: { primary: '#059669', bg: '#ecfdf5', text: '#064e3b' },
  crimson: { primary: '#be123c', bg: '#fff1f2', text: '#4c0519' },
};

const FONTS = {
  serif: "'Playfair Display', serif",
  sans: "'Outfit', sans-serif",
  classic: "'Crimson Pro', serif",
};

const BACKGROUNDS = [
  "https://www.transparenttextures.com/patterns/natural-paper.png",
  "https://www.transparenttextures.com/patterns/pinstriped-suit.png",
  "https://www.transparenttextures.com/patterns/sandpaper.png",
  "https://www.transparenttextures.com/patterns/linen.png"
];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('GARDEN');
  const [pillars, setPillars] = useState<Pillar[]>(() => JSON.parse(localStorage.getItem('aaru_pillars') || JSON.stringify(DEFAULT_PILLARS)));
  const [goals, setGoals] = useState<Goal[]>(() => JSON.parse(localStorage.getItem('aaru_goals') || JSON.stringify(INITIAL_GOALS)));
  const [habits, setHabits] = useState<Habit[]>(() => JSON.parse(localStorage.getItem('aaru_habits') || JSON.stringify(INITIAL_HABITS)));
  const [settings, setSettings] = useState<AppSettings>(() => JSON.parse(localStorage.getItem('aaru_settings') || JSON.stringify({
    appName: "Garden of Aaru",
    motto: "Where your legacy grows",
    theme: 'gold',
    font: 'serif',
    bgPattern: BACKGROUNDS[0]
  })));
  
  const [dailyQuote, setDailyQuote] = useState<{quote: string, author: string} | null>(null);
  const [selectedPillarId, setSelectedPillarId] = useState<string>(pillars[0]?.id || 'intellectual');
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('month');

  useEffect(() => {
    localStorage.setItem('aaru_pillars', JSON.stringify(pillars));
    localStorage.setItem('aaru_goals', JSON.stringify(goals));
    localStorage.setItem('aaru_habits', JSON.stringify(habits));
    localStorage.setItem('aaru_settings', JSON.stringify(settings));
  }, [pillars, goals, habits, settings]);

  useEffect(() => {
    const fetchQuote = async () => {
      const data = await getDailyWisdom();
      setDailyQuote(data);
    };
    fetchQuote();
  }, []);

  const getGrowthStats = (goalId: string) => {
    const goalHabits = habits.filter(h => h.goalId === goalId);
    if (goalHabits.length === 0) return 0;
    const totalCompletions = goalHabits.reduce((acc, h) => acc + h.completedDates.length, 0);
    const target = goalHabits.length * 10;
    return Math.min((totalCompletions / target) * 100, 100);
  };

  const toggleHabit = (id: string, dateStr?: string) => {
    const today = dateStr || new Date().toISOString().split('T')[0];
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const isDone = h.completedDates.includes(today);
        return {
          ...h,
          completedDates: isDone ? h.completedDates.filter(d => d !== today) : [...h.completedDates, today]
        };
      }
      return h;
    }));
  };

  const deleteGoal = (goalId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if(confirm('Are you certain you wish to dissolve this vision? Associated rituals will also vanish.')) {
      setGoals(prev => prev.filter(g => g.id !== goalId));
      setHabits(prev => prev.filter(h => h.goalId !== goalId));
    }
  };

  const currentTheme = THEMES[settings.theme];
  const currentFont = FONTS[settings.font];

  const renderGarden = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
      {pillars.map(p => {
        const pGoals = goals.filter(g => g.pillarId === p.id);
        return (
          <div key={p.id} className="glass-card rounded-[2.5rem] p-8 relative overflow-hidden group border border-white/20 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl filter drop-shadow-sm">{p.icon}</span>
              <h3 className="font-serif text-xl font-bold" style={{ color: currentTheme.text }}>{p.name}</h3>
            </div>
            <p className="text-[10px] opacity-60 mb-6 leading-tight italic">{p.description}</p>
            <div className="space-y-4">
              {pGoals.length > 0 ? pGoals.map(g => {
                const progress = getGrowthStats(g.id);
                const visual = progress === 0 ? '🌱' : progress < 30 ? '🌿' : progress < 70 ? '🪴' : '🌳';
                return (
                  <div key={g.id} className="flex items-center gap-4 bg-white/40 p-4 rounded-2xl cursor-pointer hover:bg-white/60 transition-all border border-white/20 shadow-sm" onClick={() => { setCurrentView('TIMELINE'); setExpandedGoalId(g.id); }}>
                    <div className="text-4xl animate-float">{visual}</div>
                    <div className="flex-1">
                      <p className="font-bold text-sm" style={{ color: currentTheme.text }}>{g.title}</p>
                      <div className="w-full h-1.5 bg-gray-200/30 rounded-full mt-2 overflow-hidden">
                        <div className="h-full transition-all duration-1000" style={{ width: `${progress}%`, backgroundColor: p.color || currentTheme.primary }} />
                      </div>
                    </div>
                  </div>
                );
              }) : <p className="text-xs opacity-50 italic">No seeds yet. Plant a vision for this pillar.</p>}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderTimeline = () => {
    const sortedGoals = [...goals].sort((a, b) => a.startDate.localeCompare(b.startDate));
    let lastMarker = "";

    return (
      <div className="max-w-5xl mx-auto py-12 px-6">
        <div className="relative">
          {/* Vertical Center Line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-current to-transparent opacity-10" style={{ color: currentTheme.primary }} />
          
          <div className="space-y-12">
            {sortedGoals.map((goal, index) => {
              const pillar = pillars.find(p => p.id === goal.pillarId);
              const goalHabits = habits.filter(h => h.goalId === goal.id);
              const isExpanded = expandedGoalId === goal.id;
              
              const dateObj = new Date(goal.startDate);
              const marker = dateObj.toLocaleDateString('default', { month: 'long', year: 'numeric' });
              const showMarker = marker !== lastMarker;
              if (showMarker) lastMarker = marker;

              return (
                <div key={goal.id} className="relative">
                  {showMarker && (
                    <div className="flex justify-center mb-12">
                      <span className="bg-white/40 px-6 py-2 rounded-full border border-white/20 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-sm shadow-sm">
                        {marker}
                      </span>
                    </div>
                  )}

                  <div className={`flex items-center w-full ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className="w-5/12">
                      <div 
                        className={`bg-white/60 p-6 rounded-[2rem] shadow-sm cursor-pointer border-2 border-transparent hover:border-white transition-all backdrop-blur-sm relative group ${index % 2 === 0 ? 'text-right' : 'text-left'}`}
                        onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                      >
                         <div className={`flex items-center gap-3 mb-2 ${index % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span className="text-2xl filter drop-shadow-sm">{pillar?.icon}</span>
                            <div className="flex flex-col">
                               <span className="text-[9px] font-black uppercase tracking-widest opacity-50" style={{ color: pillar?.color }}>{pillar?.name}</span>
                               <h4 className="text-xl font-serif font-black leading-tight" style={{ color: currentTheme.text }}>{goal.title}</h4>
                            </div>
                         </div>
                         <p className="text-xs opacity-70 mb-2 line-clamp-2">{goal.description}</p>
                         <div className={`text-[8px] font-bold opacity-30 ${index % 2 === 0 ? 'text-left' : 'text-right'}`}>{goal.startDate} — {goal.endDate}</div>

                         {isExpanded && (
                           <div className="mt-4 pt-4 border-t border-black/5 space-y-2 animate-in fade-in slide-in-from-top-2">
                             {goalHabits.map(h => (
                               <div key={h.id} className={`flex items-center gap-2 ${index % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}`}>
                                  <span className="text-[10px]">{h.completedDates.includes(new Date().toISOString().split('T')[0]) ? '✅' : '⏳'}</span>
                                  <span className="text-[10px] font-bold opacity-60">{h.title}</span>
                                  <span className="text-[8px] opacity-30">({h.startTime || '--:--'})</span>
                               </div>
                             ))}
                           </div>
                         )}
                      </div>
                    </div>

                    <div className="w-2/12 flex justify-center z-10">
                      <div 
                        className="w-8 h-8 rounded-full border-4 border-white shadow-xl flex items-center justify-center transition-all hover:scale-125 cursor-pointer"
                        style={{ backgroundColor: pillar?.color || currentTheme.primary }}
                        onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                      >
                         <span className="text-[10px] text-white">𓁹</span>
                      </div>
                    </div>

                    <div className="w-5/12" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderArchitect = () => (
    <div className="max-w-4xl mx-auto space-y-16 animate-in slide-in-from-bottom-4">
      <section className="bg-white/40 p-10 rounded-[3rem] border border-white/50 backdrop-blur-md shadow-inner">
        <h2 className="font-serif text-3xl mb-8 flex items-center gap-3">
          <span className="text-3xl">𓉴</span> The Blueprint of Life
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {pillars.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-3xl shadow-sm border-l-8 flex flex-col justify-between" style={{ borderLeftColor: p.color }}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.icon}</span>
                  <h4 className="font-bold text-lg">{p.name}</h4>
                </div>
                <button 
                  onClick={() => {
                    if(confirm('A pillar is a sacred foundation. Deleting it will archive all its goals. Proceed?')) {
                      setPillars(pillars.filter(pil => pil.id !== p.id));
                    }
                  }}
                  className="text-rose-200 hover:text-rose-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
              <p className="text-xs opacity-60 leading-relaxed mb-4">{p.description}</p>
              <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase opacity-40">Pillar Essence</span>
                <input 
                  type="color" 
                  value={p.color} 
                  onChange={(e) => setPillars(pillars.map(pil => pil.id === p.id ? {...pil, color: e.target.value} : pil))}
                  className="w-6 h-6 rounded-md cursor-pointer border-none bg-transparent shadow-sm"
                />
              </div>
            </div>
          ))}
          
          <div className="bg-white/30 p-6 rounded-3xl border-2 border-dashed border-gray-300 flex flex-col gap-4 group hover:border-gray-400 transition-all">
             <div className="flex gap-2">
                <input type="text" id="new-p-icon" placeholder="Emoji" className="bg-white p-3 rounded-xl text-center text-xl w-16 shadow-inner" />
                <input type="text" id="new-p-name" placeholder="Name of Foundation" className="flex-1 bg-white p-3 rounded-xl shadow-inner" />
             </div>
             <textarea id="new-p-desc" placeholder="What does this pillar represent in your life?" className="bg-white p-3 rounded-xl text-xs h-20 resize-none shadow-inner" />
             <button 
                className="bg-black text-white p-3 rounded-xl font-bold hover:bg-gray-800 shadow-lg active:scale-95 transition-all"
                onClick={() => {
                  const icon = (document.getElementById('new-p-icon') as HTMLInputElement).value || '📜';
                  const name = (document.getElementById('new-p-name') as HTMLInputElement).value;
                  const desc = (document.getElementById('new-p-desc') as HTMLTextAreaElement).value;
                  if(!name) return;
                  setPillars([...pillars, { 
                    id: Math.random().toString(36).substr(2, 9), 
                    name, 
                    icon, 
                    description: desc, 
                    color: '#94a3b8', 
                    gradient: 'from-gray-400 to-gray-500' 
                  }]);
                  (document.getElementById('new-p-icon') as HTMLInputElement).value = '';
                  (document.getElementById('new-p-name') as HTMLInputElement).value = '';
                  (document.getElementById('new-p-desc') as HTMLTextAreaElement).value = '';
                }}
             >Erect New Pillar</button>
          </div>
        </div>
      </section>

      <section className="bg-white/60 p-10 rounded-[3rem] border-2 border-dashed border-white/80 backdrop-blur-sm">
        <h2 className="font-serif text-3xl mb-6 flex items-center gap-3">
          <span className="text-3xl">🔭</span> Carving Visions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {pillars.map(p => (
            <button 
              key={p.id}
              onClick={() => setSelectedPillarId(p.id)}
              className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 text-left ${selectedPillarId === p.id ? 'bg-white shadow-lg' : 'border-transparent bg-white/20'}`}
              style={{ borderColor: selectedPillarId === p.id ? p.color : 'transparent' }}
            >
              <span className="text-2xl">{p.icon}</span>
              <span className="font-bold text-[10px] leading-tight uppercase">{p.name}</span>
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <input id="new-g-title" type="text" placeholder="Title of your vision..." className="w-full bg-white p-6 rounded-3xl shadow-inner text-xl outline-none" />
            <textarea id="new-g-desc" placeholder="Describe the outcome you seek..." className="w-full bg-white p-6 rounded-3xl h-24 shadow-inner text-sm outline-none resize-none" />
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase opacity-40 ml-2">Rise Date</label>
                <input id="new-g-start" type="date" className="bg-white p-4 rounded-2xl shadow-inner text-sm outline-none" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase opacity-40 ml-2">Apex Date</label>
                <input id="new-g-end" type="date" className="bg-white p-4 rounded-2xl shadow-inner text-sm outline-none" defaultValue={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} />
              </div>
            </div>
            <button 
              className="w-full p-6 rounded-3xl font-bold text-white shadow-xl transition-all active:scale-95"
              style={{ backgroundColor: pillars.find(p => p.id === selectedPillarId)?.color || 'black' }}
              onClick={() => {
                const title = (document.getElementById('new-g-title') as HTMLInputElement).value;
                const desc = (document.getElementById('new-g-desc') as HTMLTextAreaElement).value;
                const start = (document.getElementById('new-g-start') as HTMLInputElement).value;
                const end = (document.getElementById('new-g-end') as HTMLInputElement).value;
                if(!title) return;
                setGoals([...goals, {
                  id: Math.random().toString(36).substr(2, 9),
                  pillarId: selectedPillarId,
                  title,
                  description: desc,
                  startDate: start,
                  endDate: end
                }]);
                (document.getElementById('new-g-title') as HTMLInputElement).value = '';
                (document.getElementById('new-g-desc') as HTMLTextAreaElement).value = '';
              }}
            >
              Commit to the Scroll
            </button>
          </div>
        </div>
      </section>
    </div>
  );

  const renderRituals = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4">
      <div className="glass-card p-10 rounded-[3rem] border border-white/40">
        <h2 className="font-serif text-3xl mb-8 flex items-center gap-3">
          <span className="text-3xl">🏺</span> Sacred Rituals
        </h2>
        <div className="space-y-12">
          {goals.map(goal => {
            const pillar = pillars.find(p => p.id === goal.pillarId);
            return (
              <div key={goal.id} className="bg-white/60 p-8 rounded-[2rem] border border-white/50 shadow-sm relative group/goal">
                <button 
                  onClick={(e) => deleteGoal(goal.id, e)}
                  className="absolute top-6 right-6 text-rose-300 opacity-0 group-hover/goal:opacity-100 hover:text-rose-600 transition-all p-2 z-20 bg-white/40 rounded-full"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="flex justify-between items-center mb-6 pr-10">
                  <h3 className="font-serif text-2xl flex items-center gap-2" style={{ color: pillar?.color }}>
                    <span className="w-2 h-8 rounded-full" style={{ backgroundColor: pillar?.color }} />
                    {goal.title}
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{pillar?.name}</span>
                </div>
                
                <div className="space-y-4 mb-8">
                  {habits.filter(h => h.goalId === goal.id).map(h => (
                    <div key={h.id} className="flex items-center justify-between p-5 bg-white/80 rounded-2xl group border border-transparent hover:border-gray-100 transition-all shadow-sm">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => toggleHabit(h.id)}
                          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${h.completedDates.includes(new Date().toISOString().split('T')[0]) ? 'text-white' : 'border-gray-200'}`}
                          style={{ 
                            backgroundColor: h.completedDates.includes(new Date().toISOString().split('T')[0]) ? (pillar?.color || currentTheme.primary) : 'transparent', 
                            borderColor: h.completedDates.includes(new Date().toISOString().split('T')[0]) ? (pillar?.color || currentTheme.primary) : '#e5e7eb' 
                          }}
                        >
                           {h.completedDates.includes(new Date().toISOString().split('T')[0]) ? '☀️' : ''}
                        </button>
                        <div>
                          <p className={`font-bold text-lg ${h.completedDates.includes(new Date().toISOString().split('T')[0]) ? 'line-through opacity-30' : ''}`}>{h.title}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="text-[8px] font-black uppercase bg-gray-100 px-2 py-0.5 rounded text-gray-500 shadow-sm">{h.frequency}</span>
                            <span className="text-[8px] opacity-40 font-bold">{h.startDate} → {h.endDate}</span>
                            {h.startTime && <span className="text-[8px] font-bold opacity-60">🕒 {h.startTime}</span>}
                            {h.duration && <span className="text-[8px] font-bold opacity-60">⏱️ {h.duration}m</span>}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setHabits(habits.filter(hab => hab.id !== h.id))} className="opacity-0 group-hover:opacity-100 text-rose-300 hover:text-rose-500 p-2 transition-all">
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-100/30 p-6 rounded-[1.5rem] border border-white/20 flex flex-col gap-4 shadow-inner">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input id={`h-title-${goal.id}`} type="text" placeholder="Ritual name..." className="md:col-span-1 bg-white p-4 rounded-xl text-sm shadow-inner" />
                    <select id={`h-freq-${goal.id}`} className="bg-white p-4 rounded-xl text-sm shadow-inner outline-none">
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="one-off">One-off</option>
                    </select>
                    <input id={`h-time-${goal.id}`} type="time" className="bg-white p-4 rounded-xl text-sm shadow-inner outline-none" defaultValue="08:00" />
                    <input id={`h-dur-${goal.id}`} type="number" placeholder="Duration (min)" className="bg-white p-4 rounded-xl text-sm shadow-inner outline-none" defaultValue="30" />
                  </div>
                  <div className="flex gap-4 items-center">
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-[8px] font-black opacity-30 uppercase ml-2">Ritual Start</label>
                      <input id={`h-start-${goal.id}`} type="date" className="bg-white p-3 rounded-xl shadow-inner text-xs" defaultValue={goal.startDate} />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-[8px] font-black opacity-30 uppercase ml-2">Ritual End</label>
                      <input id={`h-end-${goal.id}`} type="date" className="bg-white p-3 rounded-xl shadow-inner text-xs" defaultValue={goal.endDate} />
                    </div>
                    <button 
                      className="p-4 rounded-xl text-white font-bold transition-all active:scale-95 shadow-lg mt-5"
                      style={{ backgroundColor: pillar?.color || 'black' }}
                      onClick={() => {
                        const titleInput = (document.getElementById(`h-title-${goal.id}`) as HTMLInputElement);
                        const freq = (document.getElementById(`h-freq-${goal.id}`) as HTMLSelectElement).value as any;
                        const start = (document.getElementById(`h-start-${goal.id}`) as HTMLInputElement).value;
                        const end = (document.getElementById(`h-end-${goal.id}`) as HTMLInputElement).value;
                        const time = (document.getElementById(`h-time-${goal.id}`) as HTMLInputElement).value;
                        const duration = parseInt((document.getElementById(`h-dur-${goal.id}`) as HTMLInputElement).value) || 0;
                        if(!titleInput.value) return;
                        setHabits([...habits, {
                          id: Math.random().toString(36).substr(2, 9),
                          title: titleInput.value,
                          goalId: goal.id,
                          pillarId: goal.pillarId,
                          completedDates: [],
                          frequency: freq,
                          startDate: start,
                          endDate: end,
                          startTime: time,
                          duration: duration,
                          createdAt: Date.now()
                        }]);
                        titleInput.value = '';
                      }}
                    >
                      Bind Ritual
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderCalendar = () => {
    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
    
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const monthName = calendarDate.toLocaleString('default', { month: 'long' });
    
    const changeDate = (offset: number) => {
      const newDate = new Date(calendarDate);
      if (calendarView === 'month') newDate.setMonth(month + offset);
      else if (calendarView === 'week') newDate.setDate(newDate.getDate() + offset * 7);
      else newDate.setDate(newDate.getDate() + offset);
      setCalendarDate(newDate);
    };

    const renderMonth = () => {
      const days = [];
      const totalDays = daysInMonth(year, month);
      const startDay = firstDayOfMonth(year, month);
      
      for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-32 bg-gray-50/20" />);
      }
      
      for (let d = 1; d <= totalDays; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const ritualsForDay = habits.filter(h => {
          const isStarted = dateStr >= h.startDate;
          const isNotEnded = dateStr <= h.endDate;
          return isStarted && isNotEnded && (h.frequency === 'daily' || h.completedDates.includes(dateStr));
        });
        
        days.push(
          <div key={d} className="h-32 border border-white/10 p-2 bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20">
            <span className="text-[10px] font-bold opacity-30">{d}</span>
            <div className="mt-1 space-y-1 overflow-y-auto max-h-24">
              {ritualsForDay.map(h => {
                const isDone = h.completedDates.includes(dateStr);
                const pillar = pillars.find(p => p.id === h.pillarId);
                return (
                  <div 
                    key={h.id} 
                    className="group relative flex items-center gap-1 p-1 rounded-md text-[8px] font-bold truncate cursor-pointer transition-all active:scale-95"
                    style={{ backgroundColor: isDone ? pillar?.color : `${pillar?.color}30`, color: isDone ? 'white' : pillar?.color }}
                    onClick={() => toggleHabit(h.id, dateStr)}
                  >
                    <span>{pillar?.icon}</span>
                    <span className="truncate">{h.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
      
      return (
        <div className="grid grid-cols-7 border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-4 text-center text-[10px] font-black uppercase opacity-40 bg-white/20 border-b border-white/20">{day}</div>
          ))}
          {days}
        </div>
      );
    };

    const renderWeek = () => {
      const startOfWeek = new Date(calendarDate);
      startOfWeek.setDate(calendarDate.getDate() - calendarDate.getDay());
      
      return (
        <div className="flex border border-white/20 rounded-3xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm">
          <div className="w-16 border-r border-white/20 flex flex-col pt-16">
            {TIME_SLOTS.map(time => (
              <div key={time} className="h-20 text-[8px] font-black uppercase opacity-30 text-right pr-2">{time}</div>
            ))}
          </div>
          <div className="flex flex-1 overflow-x-auto">
            {Array.from({ length: 7 }, (_, i) => {
              const day = new Date(startOfWeek);
              day.setDate(startOfWeek.getDate() + i);
              const dateStr = day.toISOString().split('T')[0];
              
              return (
                <div key={i} className="flex-1 min-w-[120px] border-r border-white/10 relative">
                  <div className="text-center p-4 border-b border-white/10 h-16 flex flex-col justify-center">
                    <p className="text-[8px] font-black uppercase opacity-30">{day.toLocaleString('default', { weekday: 'short' })}</p>
                    <p className="text-lg font-serif font-black leading-none">{day.getDate()}</p>
                  </div>
                  <div className="relative h-[1920px]">
                    {TIME_SLOTS.map(t => <div key={t} className="h-20 border-b border-white/5 w-full" />)}
                    {habits.filter(h => dateStr >= h.startDate && dateStr <= h.endDate).map(h => {
                      const hour = h.startTime ? parseInt(h.startTime.split(':')[0]) : 0;
                      const pillar = pillars.find(p => p.id === h.pillarId);
                      const isDone = h.completedDates.includes(dateStr);
                      const itemHeight = Math.max(30, (h.duration || 60) * (80/60));
                      return (
                        <div 
                          key={h.id}
                          className="absolute left-1 right-1 p-2 rounded-xl text-[9px] font-bold shadow-sm cursor-pointer transition-all hover:scale-105 active:scale-95 z-10"
                          style={{ 
                            top: `${hour * 80 + 4}px`, 
                            height: `${itemHeight - 8}px`, 
                            backgroundColor: isDone ? pillar?.color : 'white', 
                            color: isDone ? 'white' : pillar?.color,
                            border: `1px solid ${pillar?.color}40`
                          }}
                          onClick={() => toggleHabit(h.id, dateStr)}
                        >
                          <div className="flex justify-between items-start">
                             <span>{pillar?.icon}</span>
                             {isDone && <span className="text-[10px]">☀️</span>}
                          </div>
                          <p className="truncate mt-1">{h.title}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    const renderDay = () => {
      const dateStr = calendarDate.toISOString().split('T')[0];
      
      return (
        <div className="max-w-4xl mx-auto flex bg-white/30 rounded-[3rem] border border-white/40 shadow-2xl backdrop-blur-md overflow-hidden">
          <div className="w-20 border-r border-white/20 flex flex-col pt-32">
            {TIME_SLOTS.map(time => (
              <div key={time} className="h-24 text-[10px] font-black uppercase opacity-30 text-right pr-4">{time}</div>
            ))}
          </div>
          <div className="flex-1 relative">
            <div className="p-8 border-b border-white/20 text-center">
               <p className="text-xs font-black uppercase tracking-[0.3em] opacity-40">{calendarDate.toLocaleString('default', { weekday: 'long' })}</p>
               <h3 className="text-4xl font-serif font-black">{calendarDate.getDate()} {monthName}</h3>
            </div>
            <div className="relative h-[2304px]">
               {TIME_SLOTS.map(t => <div key={t} className="h-24 border-b border-white/5 w-full" />)}
               {habits.filter(h => dateStr >= h.startDate && dateStr <= h.endDate).map(h => {
                 const hour = h.startTime ? parseInt(h.startTime.split(':')[0]) : 0;
                 const pillar = pillars.find(p => p.id === h.pillarId);
                 const isDone = h.completedDates.includes(dateStr);
                 const itemHeight = Math.max(60, (h.duration || 60) * (96/60));
                 return (
                    <div 
                      key={h.id}
                      className="absolute left-4 right-4 p-4 rounded-[1.5rem] text-sm font-black uppercase shadow-lg cursor-pointer transition-all hover:brightness-110 active:scale-[0.98] group z-10"
                      style={{ 
                        top: `${hour * 96 + 8}px`, 
                        height: `${itemHeight - 16}px`, 
                        backgroundColor: isDone ? pillar?.color : 'white', 
                        color: isDone ? 'white' : pillar?.color 
                      }}
                      onClick={() => toggleHabit(h.id, dateStr)}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl filter drop-shadow-md">{pillar?.icon}</span>
                        <div className="flex-1 truncate">
                           <p className="truncate text-base">{h.title}</p>
                           <p className="text-[10px] opacity-60">{h.startTime} — {h.duration || 60} min</p>
                        </div>
                        {isDone ? <span className="text-2xl">☀️</span> : <div className="w-8 h-8 rounded-full border-2 border-current opacity-10 group-hover:opacity-100" />}
                      </div>
                    </div>
                 );
               })}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => changeDate(-1)} className="p-3 bg-white/40 rounded-full hover:bg-white shadow-sm transition-all">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h2 className="text-3xl font-serif font-bold min-w-[200px] text-center">{monthName} {year}</h2>
            <button onClick={() => changeDate(1)} className="p-3 bg-white/40 rounded-full hover:bg-white shadow-sm transition-all">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          
          <div className="flex gap-2 p-1 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/10">
            {['day', 'week', 'month'].map(v => (
              <button 
                key={v}
                onClick={() => setCalendarView(v as any)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${calendarView === v ? 'bg-black text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        
        <div className="max-h-[800px] overflow-y-auto rounded-3xl custom-scrollbar border border-white/20">
          {calendarView === 'month' && renderMonth()}
          {calendarView === 'week' && renderWeek()}
          {calendarView === 'day' && renderDay()}
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="max-w-2xl mx-auto bg-white/40 p-12 rounded-[3rem] border border-white/50 animate-in slide-in-from-bottom-4 backdrop-blur-md shadow-sm">
      <h2 className="font-serif text-3xl mb-8 flex items-center gap-3">
        <span className="text-3xl">⚙️</span> Scribe's Chambers
      </h2>
      
      <div className="space-y-8">
        <div className="space-y-4">
          <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Sanctuary Name</label>
          <input 
            type="text" 
            value={settings.appName} 
            onChange={(e) => setSettings({...settings, appName: e.target.value})}
            className="w-full bg-white p-4 rounded-2xl shadow-inner text-xl font-serif outline-none border border-transparent focus:border-gray-200 transition-all"
          />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Sacred Motto</label>
          <input 
            type="text" 
            value={settings.motto} 
            onChange={(e) => setSettings({...settings, motto: e.target.value})}
            className="w-full bg-white p-4 rounded-2xl shadow-inner text-sm outline-none border border-transparent focus:border-gray-200 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Atmosphere (Theme)</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map((t) => (
                <button
                  key={t}
                  onClick={() => setSettings({...settings, theme: t})}
                  className={`p-3 rounded-xl border-2 transition-all text-[10px] font-black uppercase tracking-tighter ${settings.theme === t ? 'border-black bg-white shadow-md' : 'border-transparent bg-white/20 opacity-60'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Script (Font)</label>
            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(FONTS) as Array<keyof typeof FONTS>).map((f) => (
                <button
                  key={f}
                  onClick={() => setSettings({...settings, font: f})}
                  className={`p-3 rounded-xl border-2 transition-all text-xs font-bold capitalize ${settings.font === f ? 'border-black bg-white shadow-md' : 'border-transparent bg-white/20 opacity-60'}`}
                  style={{ fontFamily: FONTS[f] }}
                >
                  {f} style
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Tablet Surface (Texture)</label>
          <div className="flex gap-4">
            {BACKGROUNDS.map((bg, idx) => (
              <button
                key={idx}
                onClick={() => setSettings({...settings, bgPattern: bg})}
                className={`w-12 h-12 rounded-xl border-2 transition-all shadow-sm ${settings.bgPattern === bg ? 'border-black scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                style={{ backgroundImage: `url(${bg})`, backgroundSize: 'cover' }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200/30 flex justify-between items-center">
        <p className="text-[10px] opacity-40 italic">Changes are etched into your memory.</p>
        <button 
          onClick={() => {
            if(window.confirm("Restore ancient foundations? This clears all progress.")) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="text-[10px] font-bold uppercase text-rose-400 hover:text-rose-600 tracking-widest p-2"
        >
          Dissolve Progress
        </button>
      </div>
    </div>
  );

  return (
    <div 
      className="min-h-screen transition-all duration-500 relative pb-20" 
      style={{ 
        backgroundColor: currentTheme.bg, 
        fontFamily: currentFont, 
        color: currentTheme.text,
        backgroundImage: `url("${settings.bgPattern}")`,
        backgroundAttachment: 'fixed'
      }}
    >
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>
      
      <div className="max-w-6xl mx-auto pt-16 px-6 text-center">
        <header className="mb-8">
          <h1 className="text-6xl font-serif font-black tracking-tighter mb-2">{settings.appName}</h1>
          <p className="font-bold uppercase tracking-[0.3em] text-[10px] opacity-60" style={{ color: currentTheme.primary }}>{settings.motto}</p>
        </header>

        {dailyQuote && (
          <div className="mb-16 animate-in fade-in duration-1000 max-w-2xl mx-auto border-t border-b border-black/5 py-8 backdrop-blur-sm">
             <p className="text-2xl font-serif italic mb-3 leading-relaxed">"{dailyQuote.quote}"</p>
             <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">— {dailyQuote.author} —</p>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-48">
        {currentView === 'GARDEN' && renderGarden()}
        {currentView === 'TIMELINE' && renderTimeline()}
        {currentView === 'ARCHITECT' && renderArchitect()}
        {currentView === 'RITUALS' && renderRituals()}
        {currentView === 'CALENDAR' && renderCalendar()}
        {currentView === 'SETTINGS' && renderSettings()}
      </div>

      <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 glass-card px-8 py-5 rounded-[2.5rem] flex gap-8 shadow-2xl border border-white/50 backdrop-blur-xl">
        {[
          { id: 'GARDEN' as ViewType, icon: '🏛️', label: 'Sanctuary' },
          { id: 'TIMELINE' as ViewType, icon: '📜', label: 'Scroll' },
          { id: 'ARCHITECT' as ViewType, icon: '𓉴', label: 'Architect' },
          { id: 'RITUALS' as ViewType, icon: '🏺', label: 'Rituals' },
          { id: 'CALENDAR' as ViewType, icon: '🌞', label: 'Solar Cycle' },
          { id: 'SETTINGS' as ViewType, icon: '⚙️', label: 'Scribe' }
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`flex flex-col items-center gap-1.5 transition-all ${currentView === item.id ? 'scale-110 opacity-100' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}
            style={{ color: currentView === item.id ? currentTheme.primary : 'inherit' }}
          >
            <span className="text-3xl filter drop-shadow-md">{item.icon}</span>
            <span className={`text-[8px] font-black uppercase tracking-widest`}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
