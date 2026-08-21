import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Terminal, Code, Sparkles, LayoutGrid, Play, X, Minus, Maximize2, ChevronDown, FolderTree, Loader2 } from 'lucide-react';

export function MockIDE() {
  const [activeTab, setActiveTab] = useState('App.jsx');
  const [activeTheme, setActiveTheme] = useState('brutalist');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isReady, setIsReady] = useState(true);
  const [completedProjects, setCompletedProjects] = useState(142);
  const [liveUsers, setLiveUsers] = useState(38);
  const [isClosed, setIsClosed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isGlowActive, setIsGlowActive] = useState(false);

  // Compilation states
  const [buildStatus, setBuildStatus] = useState('idle'); // 'idle' | 'compiling' | 'success'
  const [buildLogs, setBuildLogs] = useState([]);

  // Live user ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers(prev => {
        const diff = Math.floor(Math.random() * 5) - 2;
        const textNext = prev + diff;
        return textNext < 15 ? 15 : textNext > 95 ? 95 : textNext;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const THEMES = {
    brutalist: {
      name: 'Brutalist Gold',
      primary: '#FFCC00',
      accent: '#FF5C5C',
      bgClass: 'bg-[#121214]',
      textClass: 'text-[#FFCC00]',
      glowColor: 'from-[#FFCC00]/20 via-[#FF5C5C]/15 to-transparent',
      borderColor: 'border-[#FFCC00]/20'
    },
    cyberpunk: {
      name: 'Neon Cyber',
      primary: '#00F0FF',
      accent: '#FF007F',
      bgClass: 'bg-[#0b0c10]',
      textClass: 'text-[#00F0FF]',
      glowColor: 'from-[#00F0FF]/25 via-[#FF007F]/15 to-transparent',
      borderColor: 'border-[#00F0FF]/30'
    },
    sunset: {
      name: 'Sunset Glow',
      primary: '#FF7E5F',
      accent: '#FEB47B',
      bgClass: 'bg-[#181214]',
      textClass: 'text-[#FF7E5F]',
      glowColor: 'from-[#FF7E5F]/20 via-[#FEB47B]/15 to-transparent',
      borderColor: 'border-[#FF7E5F]/20'
    },
    emerald: {
      name: 'Mint Emerald',
      primary: '#00C48C',
      accent: '#A855F7',
      bgClass: 'bg-[#080d0b]',
      textClass: 'text-[#00C48C]',
      glowColor: 'from-[#00C48C]/20 via-[#A855F7]/15 to-transparent',
      borderColor: 'border-[#00C48C]/20'
    }
  };

  const currentTheme = THEMES[activeTheme];

  // Simulated compilation logs
  const runBuild = () => {
    if (buildStatus === 'compiling') return;
    setBuildStatus('compiling');
    setActiveTab('terminal.log');
    setBuildLogs([]);

    const logSteps = [
      { text: '$ synectra build --prod', delay: 100 },
      { text: '⠋ Resolving modules and dependencies...', delay: 350 },
      { text: '✔ Resolution finished [0.3s]', delay: 600 },
      { text: '⠙ Packaging files and styling assets...', delay: 850 },
      { text: '✔ App.jsx compiled [12ms]', delay: 1100 },
      { text: '✔ synectra.css compiled [8ms]', delay: 1300 },
      { text: '✔ Bundles optimized successfully (124kb)', delay: 1550 },
      { text: '🚀 Pushing staging deployment to Edge nodes...', delay: 1750 },
      { text: '✔ Live deployment: https://synectra.agency', delay: 2000 },
      { text: '🎉 SUCCESS: App is fully live!', delay: 2200 }
    ];

    logSteps.forEach((step, index) => {
      setTimeout(() => {
        setBuildLogs(prev => [...prev, step.text]);
        if (index === logSteps.length - 1) {
          setBuildStatus('success');
          // auto transition to preview dashboard after build success
          setTimeout(() => {
            setActiveTab('dashboard.jsx');
            // Trigger temporary glow burst
            setIsGlowActive(true);
            setTimeout(() => setIsGlowActive(false), 1200);
          }, 800);
        }
      }, step.delay);
    });
  };

  const files = [
    { name: 'App.jsx', type: 'code', icon: <Code className="w-3 h-3 text-[#4D61FF]" /> },
    { name: 'dashboard.jsx', type: 'preview', icon: <LayoutGrid className="w-3 h-3 text-[#00C48C]" /> },
    { name: 'synectra.css', type: 'style', icon: <Sparkles className="w-3 h-3 text-[#FFCC00]" /> }
  ];

  if (buildStatus !== 'idle') {
    files.push({ name: 'terminal.log', type: 'log', icon: <Terminal className="w-3 h-3 text-white/40" /> });
  }

  if (isClosed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsClosed(false)}
        className="cursor-pointer group relative flex items-center gap-3 px-5 py-3.5 bg-[#0d0d0f]/95 border-2 border-neu-black rounded-xl shadow-neu-solid hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform select-none z-30"
        style={{ borderColor: currentTheme.primary }}
      >
        <div className="absolute -inset-2 rounded-xl blur-lg opacity-40 transition-all duration-300 bg-gradient-to-r from-neu-gold to-neu-accent animate-pulse" />
        <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <Terminal className="w-3.5 h-3.5 text-white/70 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[8px] text-white/40 uppercase tracking-widest font-bold">IDE COLLAPSED</span>
          <span className="font-display text-xs text-white/90 font-bold tracking-wide">
            Restore Workstation ✦
          </span>
        </div>
        <span className="flex w-2 h-2 rounded-full relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: currentTheme.primary }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: currentTheme.primary }} />
        </span>
      </motion.div>
    );
  }

  return (
    <div className="relative w-full max-w-[500px]">
      {/* Ambient background glow */}
      <div className={cn(
        "absolute -inset-10 rounded-full blur-[100px] opacity-40 transition-all duration-700 pointer-events-none bg-gradient-to-tr",
        currentTheme.glowColor
      )} />

      {/* Main IDE Window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.85, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "relative w-full bg-[#121214]/85 backdrop-blur-xl border-2 rounded-xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.85)] group flex flex-col transition-all duration-500",
          isGlowActive ? "shadow-[0_0_35px_rgba(0,196,140,0.25)] border-[#00C48C]" : currentTheme.borderColor
        )}
      >
        {/* Top Bar / Chrome Window Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0a0a0c] border-b border-white/5 relative z-10">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsClosed(true)}
              className="w-3 h-3 rounded-full bg-neu-accent/80 border border-neu-accent flex items-center justify-center group/btn relative cursor-pointer"
              title="Close Editor"
            >
              <X className="w-1.5 h-1.5 text-black opacity-0 group-hover/btn:opacity-100 transition-opacity absolute" />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-3 h-3 rounded-full bg-[#FFB800] border border-[#E0A200] flex items-center justify-center group/btn relative cursor-pointer"
              title="Toggle Minimize"
            >
              <Minus className="w-1.5 h-1.5 text-black opacity-0 group-hover/btn:opacity-100 transition-opacity absolute" />
            </button>
            <button
              onClick={() => {
                setIsGlowActive(true);
                setTimeout(() => setIsGlowActive(false), 1200);
              }}
              className="w-3 h-3 rounded-full bg-[#00C48C]/80 border border-[#00A877] flex items-center justify-center group/btn relative cursor-pointer"
              title="Trigger Boost"
            >
              <Maximize2 className="w-1.5 h-1.5 text-black opacity-0 group-hover/btn:opacity-100 transition-opacity absolute" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Terminal className="w-3 h-3 text-white/35" />
            <span className="font-mono text-[9px] text-white/35 uppercase tracking-widest font-bold">synectra-compiler v2.4</span>
          </div>

          {/* Run Button */}
          <div className="flex items-center">
            <button
              onClick={runBuild}
              disabled={buildStatus === 'compiling'}
              className={cn(
                "flex items-center gap-1 px-2.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all text-[9.5px] font-mono border border-white/10 font-bold cursor-pointer",
                buildStatus === 'compiling' && "opacity-50 cursor-not-allowed bg-[#FFCC00]/10 border-[#FFCC00]/20 text-[#FFCC00]"
              )}
            >
              {buildStatus === 'compiling' ? (
                <Loader2 className="w-2.5 h-2.5 animate-spin text-[#FFCC00]" />
              ) : (
                <Play className="w-2.5 h-2.5 fill-current text-[#00C48C]" />
              )}
              <span>{buildStatus === 'compiling' ? 'BUILDING...' : 'RUN BUILD'}</span>
            </button>
          </div>
        </div>

        {/* If Minimized, show simple status info */}
        {isMinimized && (
          <div className="px-4 py-2 bg-[#0d0d0f] text-[9.5px] font-mono text-white/40 flex justify-between border-t border-white/5 items-center">
            <span>Editor minimized. Workstation active.</span>
            <span className="text-[#FFCC00] cursor-pointer hover:underline font-bold" onClick={() => setIsMinimized(false)}>Expand Workspace</span>
          </div>
        )}

        {/* Editor Main Content Section */}
        {!isMinimized && (
          <div className="flex flex-1 min-h-[250px] relative">
            {/* Sidebar File Explorer */}
            {isSidebarOpen && (
              <div className="w-[125px] flex-shrink-0 bg-[#0d0d0f] border-r border-white/5 flex flex-col justify-between p-3 font-mono text-[9.5px] select-none text-white/60">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[8px] uppercase tracking-wider text-white/35 font-bold">
                    <span>WORKSPACE</span>
                    <FolderTree className="w-2.5 h-2.5 text-white/30" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 text-white/40">
                      <ChevronDown className="w-2.5 h-2.5" />
                      <span>src</span>
                    </div>
                    <div className="pl-2 space-y-1">
                      {files.map(f => (
                        <button
                          key={f.name}
                          onClick={() => setActiveTab(f.name)}
                          className={cn(
                            "flex items-center gap-1.5 w-full text-left py-0.5 px-1 rounded transition-colors cursor-pointer",
                            activeTab === f.name
                              ? "bg-white/[0.06] text-white font-bold"
                              : "hover:bg-white/[0.03] text-white/60 hover:text-white"
                          )}
                        >
                          {f.icon}
                          <span className="truncate">{f.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Stats in Sidebar */}
                <div className="pt-2 border-t border-white/5 space-y-0.5 text-[8px] text-white/30">
                  <div className="flex justify-between">
                    <span>Branch:</span>
                    <span className="text-white/60 font-bold">main</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Modules:</span>
                    <span className="text-white/60">42</span>
                  </div>
                </div>
              </div>
            )}

            {/* Editor Content Area */}
            <div className="flex-1 flex flex-col bg-[#121214]/90 backdrop-blur-md relative overflow-hidden">
              {/* Tabs Bar */}
              <div className="flex bg-[#0d0d0f] border-b border-white/5 text-[10px] font-mono relative z-10 justify-between items-center pr-2">
                <div className="flex overflow-x-auto scrollbar-none">
                  {/* Sidebar toggle button */}
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 border-r border-white/5 text-white/40 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center cursor-pointer"
                    title="Toggle Sidebar"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 rotate-90" />
                  </button>

                  {files.map(tab => (
                    <button
                      key={tab.name}
                      onClick={() => setActiveTab(tab.name)}
                      className={cn(
                        "px-3 py-2 border-r border-white/5 transition-all flex items-center gap-1.5 relative cursor-pointer",
                        activeTab === tab.name
                          ? "bg-[#121214] text-white font-bold"
                          : "text-white/40 hover:text-white/70 hover:bg-white/5"
                      )}
                    >
                      {tab.name === 'App.jsx' && <Code className="w-2.5 h-2.5 text-[#4D61FF]" />}
                      {tab.name === 'dashboard.jsx' && <LayoutGrid className="w-2.5 h-2.5 text-[#00C48C]" />}
                      {tab.name === 'synectra.css' && <Sparkles className="w-2.5 h-2.5 text-[#FFCC00]" />}
                      {tab.name === 'terminal.log' && <Terminal className="w-2.5 h-2.5 text-white/40" />}

                      {tab.name}
                      {activeTab === tab.name && (
                        <span
                          className="absolute top-0 left-0 right-0 h-[2px] transition-colors duration-300"
                          style={{ backgroundColor: currentTheme.primary }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                <div className="text-white/30">
                  <span className="text-[8px] font-mono">UTF-8</span>
                </div>
              </div>

              {/* Text/Content view */}
              <div className="p-4 flex-1 font-mono text-[9.5px] leading-relaxed overflow-y-auto scrollbar-none relative z-10 select-text">
                {/* TAB 1: App.jsx */}
                {activeTab === 'App.jsx' && (
                  <div className="space-y-1">
                    <div>
                      <span className="text-[#FF5C5C]">import</span> React, &#123;{' '}
                      <span className="text-white/70">useState</span> &#125;{' '}
                      <span className="text-[#FF5C5C]">from</span>{' '}
                      <span className="text-[#00C48C]">'react'</span>;
                    </div>
                    <div>
                      <span className="text-[#FF5C5C]">import</span> &#123;{' '}
                      <span className="text-white/70">SystemBuilder</span> &#125;{' '}
                      <span className="text-[#FF5C5C]">from</span>{' '}
                      <span className="text-[#00C48C]">'./synectra-core'</span>;
                    </div>
                    <div className="h-1" />
                    <div>
                      <span className="text-[#FF5C5C] font-bold">export default function</span>{' '}
                      <span className="text-[#4D61FF] font-bold">DigitalPartner</span>() &#123;
                    </div>

                    <div className="pl-4">
                      <span className="text-[#FF5C5C]">const</span> [isReady, setIsReady] ={' '}
                      <span className="text-[#4D61FF]">useState</span>(
                      <button
                        onClick={() => setIsReady(!isReady)}
                        className="mx-1 px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 hover:text-white text-white border border-white/10 font-bold transition-all cursor-pointer inline-flex items-center gap-1 select-none text-[8.5px]"
                        title="Click to toggle boolean!"
                      >
                        <span className={cn("w-1.5 h-1.5 rounded-full", isReady ? "bg-[#00C48C]" : "bg-[#FF5C5C]")} />
                        {isReady ? 'true' : 'false'}
                      </button>
                      );
                    </div>

                    <div className="pl-4">
                      <span className="text-[#FF5C5C]">const</span> features = [
                      <span className="text-[#00C48C]">'Web'</span>,{' '}
                      <span className="text-[#00C48C]">'Mobile'</span>,{' '}
                      <span className="text-[#00C48C]">'Design'</span>
                      ];
                    </div>
                    <div className="h-1" />
                    <div className="pl-4"><span className="text-[#FF5C5C]">return</span> (</div>
                    <div className="pl-8 text-white/40">&lt;<span className="text-white font-bold" style={{ color: currentTheme.primary }}>SystemBuilder</span></div>
                    <div className="pl-12 text-white/50">
                      client=<span className="text-white">"You"</span>
                    </div>
                    <div className="pl-12 text-white/50">
                      status=
                      <span className="text-white">
                        &#123;isReady ?{' '}
                        <span className="text-[#00C48C]">'ACTIVE'</span> :{' '}
                        <span className="text-[#FF5C5C]">'STAGING'</span>&#125;
                      </span>
                    </div>
                    <div className="pl-12 text-white/50">
                      stack=&#123;features&#125;
                    </div>
                    <div className="pl-8 text-white/40">/&gt;</div>
                    <div className="pl-4">);</div>
                    <div>&#125;</div>

                    <div className="mt-3 pt-2.5 border-t border-white/5 text-[8.5px] text-white/30 flex items-center gap-1.5 select-none">
                      <span className="flex w-1.5 h-1.5 rounded-full bg-neu-gold animate-pulse" />
                      <span>Interactive: Click the <code className="bg-white/5 px-1 py-0.5 rounded text-white/60 font-mono">true/false</code> button above to toggle compilation state!</span>
                    </div>
                  </div>
                )}

                {/* TAB 2: dashboard.jsx */}
                {activeTab === 'dashboard.jsx' && (
                  <div className="flex flex-col gap-2.5 h-full select-none">
                    {/* Header Preview bar */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isReady ? "bg-[#00C48C]" : "bg-[#FF5C5C]")} />
                        <span className="text-[8px] text-white/50 font-bold uppercase tracking-wider">
                          {isReady ? 'ACTIVE ENVIRONMENT' : 'STAGING MODE'}
                        </span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/60 text-[7px] uppercase tracking-wider border border-white/10">
                        synectra-os
                      </span>
                    </div>

                    {/* Grid cards */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 border border-white/5 bg-[#0a0a0c] rounded flex flex-col justify-between hover:border-white/10 transition-colors">
                        <p className="text-[7px] text-white/40 uppercase font-bold tracking-wider leading-tight">Completed Projects</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs font-bold text-white font-display">{completedProjects}+</p>
                          <button
                            onClick={() => setCompletedProjects(prev => prev + 1)}
                            className="w-3.5 h-3.5 rounded bg-white/5 hover:bg-[#00C48C]/20 hover:text-[#00C48C] text-white/40 flex items-center justify-center text-[8.5px] font-bold border border-white/10 transition-colors cursor-pointer"
                            title="Increment Project Counter"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="p-2 border border-white/5 bg-[#0a0a0c] rounded flex flex-col justify-between hover:border-white/10 transition-colors">
                        <p className="text-[7px] text-white/40 uppercase font-bold tracking-wider leading-tight">Active Visitors</p>
                        <div className="flex items-baseline gap-1 mt-1">
                          <p className="text-xs font-bold font-display text-white">{liveUsers}</p>
                          <span className="text-[6.5px] text-[#00C48C] animate-pulse">● live</span>
                        </div>
                      </div>

                      <div className="p-2 border border-white/5 bg-[#0a0a0c] rounded flex flex-col justify-between hover:border-white/10 transition-colors">
                        <p className="text-[7px] text-white/40 uppercase font-bold tracking-wider leading-tight">Client Rating</p>
                        <div className="flex items-center gap-1 mt-1">
                          <p className="text-xs font-bold text-white font-display">4.9</p>
                          <span className="text-[8px] text-[#FFCC00]">★</span>
                          <span className="text-[6.5px] text-white/30 font-mono">(118)</span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Performance SVG Waveform */}
                    <div className="border border-white/5 bg-[#0a0a0c]/80 rounded p-2 flex flex-col justify-between h-[75px] hover:border-white/10 transition-all">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[7px] text-white/40 uppercase font-bold tracking-wider">PERFORMANCE MONITOR</span>
                        <span className="text-[7px] font-mono" style={{ color: currentTheme.primary }}>+18.4% monthly growth</span>
                      </div>

                      <div className="flex-1 w-full relative flex items-end overflow-hidden">
                        <svg className="w-full h-full" viewBox="0 0 320 50">
                          <defs>
                            <linearGradient id="gradient-wave" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={currentTheme.primary} stopOpacity="0.25" />
                              <stop offset="100%" stopColor={currentTheme.primary} stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          {/* Shadow path */}
                          <path
                            d="M0 45 C40 35, 80 40, 120 15 C160 -10, 200 45, 240 25 C280 5, 300 15, 320 20 L320 50 L0 50 Z"
                            fill="url(#gradient-wave)"
                          />
                          {/* Main stroke */}
                          <path
                            d="M0 45 C40 35, 80 40, 120 15 C160 -10, 200 45, 240 25 C280 5, 300 15, 320 20"
                            fill="none"
                            stroke={currentTheme.primary}
                            strokeWidth="2"
                            strokeLinecap="round"
                          />

                          {/* Floating target point */}
                          <circle cx="240" cy="25" r="3.5" fill={currentTheme.accent} />
                          <circle cx="240" cy="25" r="7" fill="none" stroke={currentTheme.accent} strokeWidth="1" className="animate-ping" />
                        </svg>

                        {/* Tooltip Overlay */}
                        <div className="absolute top-0 right-1 bg-white/[0.04] border border-white/10 px-1 py-0.5 rounded text-[6.5px] text-white/80 font-mono">
                          Node Server Response: 14ms
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: synectra.css */}
                {activeTab === 'synectra.css' && (
                  <div className="space-y-1">
                    <div><span className="text-[#A855F7]">:root</span> &#123;</div>
                    <div className="pl-4">--font-display: <span className="text-[#00C48C]">"Space Grotesk", sans-serif</span>;</div>
                    <div className="pl-4">--font-body: <span className="text-[#00C48C]">"DM Sans", sans-serif</span>;</div>
                    <div className="h-1" />
                    <div className="pl-4 text-white/30">/* Color Variables: Click a button below to swap IDE Theme */</div>

                    {/* Swapper code line */}
                    <div className="pl-4 flex items-center gap-2 flex-wrap">
                      <span>--color-primary:</span>
                      <span className="font-bold" style={{ color: currentTheme.primary }}>{currentTheme.primary}</span>;
                    </div>

                    {/* Interactive Swatches selectors */}
                    <div className="pl-4 py-2 my-1 bg-white/5 rounded-lg border border-white/5 space-y-1.5 select-none">
                      <p className="text-[8px] uppercase tracking-wider text-white/40 font-bold">Select Active Workspace Color Theme:</p>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(THEMES).map(([key, t]) => (
                          <button
                            key={key}
                            onClick={() => setActiveTheme(key)}
                            className={cn(
                              "flex items-center gap-1 px-2 py-0.5 rounded text-[8px] transition-all border font-bold cursor-pointer",
                              activeTheme === key
                                ? "bg-white/10 text-white border-white/20 shadow-sm"
                                : "bg-transparent text-white/40 border-transparent hover:text-white hover:bg-white/[0.03]"
                            )}
                          >
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: t.primary }} />
                            <span>{t.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pl-4">--color-accent: <span style={{ color: currentTheme.accent }}>{currentTheme.accent}</span>;</div>
                    <div className="pl-4">--theme-background: <span className="text-white/60">#121214</span>;</div>
                    <div className="pl-4">--border-cyber: <span className="text-white/60">1px solid var(--color-primary)</span>;</div>
                    <div>&#125;</div>
                  </div>
                )}

                {/* TAB 4: terminal.log */}
                {activeTab === 'terminal.log' && (
                  <div className="space-y-1 font-mono text-[8.5px] text-white/80 select-text">
                    {buildLogs.map((log, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-start gap-1.5",
                          log.includes('✔') && "text-[#00C48C]",
                          log.includes('🚀') && "text-white font-bold",
                          log.includes('🎉') && "text-white font-bold bg-[#00C48C]/15 border border-[#00C48C]/20 px-2 py-0.5 rounded my-0.5 inline-block"
                        )}
                      >
                        {(log.includes('⠋') || log.includes('⠙')) ? (
                          <Loader2 className="w-2.5 h-2.5 text-neu-gold animate-spin inline-shrink-0 mt-0.5" />
                        ) : null}
                        <span>{(log.includes('⠋') || log.includes('⠙')) ? log.substring(1) : log}</span>
                      </div>
                    ))}

                    {buildStatus === 'compiling' && (
                      <div className="w-1.5 h-2.5 bg-white/70 animate-pulse inline-block" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Status Bar */}
        {!isMinimized && (
          <div className="h-6 bg-[#0a0a0c] border-t border-white/5 px-3 flex items-center justify-between text-[8px] font-mono text-white/30 select-none z-10 relative">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[#00C48C] font-bold">
                <span className="w-1 h-1 rounded-full bg-[#00C48C] animate-ping" />
                Connected
              </span>
              <span>git: main</span>
              <span style={{ color: currentTheme.primary }}>● {currentTheme.name} Theme</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Ln 14, Col 5</span>
              <span>UTF-8</span>
              <span>React</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Floating Badges - Dynamically styled based on active theme colors! */}
      <div className="absolute -top-3.5 -right-3.5 z-30">
        <motion.div
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="text-neu-black border-2 border-neu-black px-2.5 py-1 text-[8.5px] font-mono font-black uppercase tracking-wider rotate-[6deg] shadow-neu-solid-sm transition-colors duration-300"
          style={{ backgroundColor: currentTheme.primary }}
        >
          ✦ TECH-PARTNER
        </motion.div>
      </div>

      <div className="absolute -bottom-3.5 -left-3.5 z-30">
        <motion.div
          animate={{ y: [3, -3, 3] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-neu-white border-2 border-neu-black px-2.5 py-1 text-[8.5px] font-mono font-black uppercase tracking-wider rotate-[-4deg] shadow-neu-solid-sm transition-colors duration-300"
          style={{ backgroundColor: currentTheme.accent }}
        >
          ✦ 100% SATISFACTION
        </motion.div>
      </div>
    </div>
  );
}
