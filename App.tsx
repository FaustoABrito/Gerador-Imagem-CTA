
import React, { useState, useRef } from 'react';
import { Tone, AppState } from './types';
import { editImage, generateMarketingCopy } from './services/geminiService';
import { SplineSceneBasic } from './components/SplineDemo';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    originalImage: null,
    referenceImage: null,
    editedImage: null,
    prompt: '',
    tone: Tone.EDUCATIVA,
    strongCTA: false,
    isLoading: false,
    error: null,
    result: null,
  });

  const originalInputRef = useRef<HTMLInputElement>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'original' | 'reference') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState(prev => ({ 
          ...prev, 
          [type === 'original' ? 'originalImage' : 'referenceImage']: reader.result as string, 
          error: null 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!state.originalImage) {
      setState(prev => ({ ...prev, error: 'Por favor, selecione uma imagem base primeiro.' }));
      return;
    }
    if (!state.prompt.trim()) {
      setState(prev => ({ ...prev, error: 'Por favor, digite uma instrução de edição.' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, result: null, editedImage: null }));

    try {
      const [newImage, copyResult] = await Promise.all([
        editImage(state.originalImage, state.referenceImage, state.prompt),
        generateMarketingCopy(state.prompt, state.tone, state.strongCTA)
      ]);

      setState(prev => ({
        ...prev,
        editedImage: newImage,
        result: copyResult,
        isLoading: false
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Erro: ${err.message || 'Ocorreu um erro inesperado.'}`
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans scroll-smooth">
      <header className="max-w-6xl mx-auto mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500 mb-2">
          SocialGen Nano Strategist
        </h1>
        <p className="text-slate-400 text-lg mb-8 font-light">
          IA Multimodal: Sincronia de Estilo e Copy de Alta Performance.
        </p>
        
        {/* 3D Interactive Component */}
        <SplineSceneBasic />
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Inputs Column */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <span className="text-6xl">🍌</span>
            </div>
            
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-full"></span>
              Setup Criativo
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Source Image */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-2">Imagem Base</label>
                  <div 
                    onClick={() => originalInputRef.current?.click()}
                    className={`aspect-square border-2 border-dashed rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-300 ${
                      state.originalImage ? 'border-cyan-500 bg-slate-900/50 shadow-inner' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                    }`}
                  >
                    {state.originalImage ? (
                      <img src={state.originalImage} className="w-full h-full object-cover" alt="Base" />
                    ) : (
                      <div className="text-center p-4">
                        <span className="text-3xl block mb-2 opacity-50">🖼️</span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase">Original</span>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={originalInputRef} onChange={(e) => handleFileChange(e, 'original')} className="hidden" accept="image/*" />
                </div>

                {/* Reference Image */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-2">Referência</label>
                  <div 
                    onClick={() => referenceInputRef.current?.click()}
                    className={`aspect-square border-2 border-dashed rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-300 ${
                      state.referenceImage ? 'border-fuchsia-500 bg-slate-900/50 shadow-inner' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                    }`}
                  >
                    {state.referenceImage ? (
                      <img src={state.referenceImage} className="w-full h-full object-cover" alt="Reference" />
                    ) : (
                      <div className="text-center p-4">
                        <span className="text-3xl block mb-2 opacity-50">🎨</span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase">Estilo</span>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={referenceInputRef} onChange={(e) => handleFileChange(e, 'reference')} className="hidden" accept="image/*" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                  Objetivo Visual
                </label>
                <textarea
                  value={state.prompt}
                  onChange={(e) => setState(prev => ({ ...prev, prompt: e.target.value }))}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl p-4 focus:ring-2 focus:ring-cyan-500 outline-none transition-all resize-none text-sm font-light text-slate-200"
                  rows={3}
                  placeholder="Ex: 'Transfira a paleta futurista da referência e mantenha o foco no produto'..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Tom de Voz</label>
                  <select 
                    value={state.tone}
                    onChange={(e) => setState(prev => ({ ...prev, tone: e.target.value as Tone }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-cyan-500 text-sm appearance-none"
                  >
                    <option value={Tone.EDUCATIVA}>📚 Educativo</option>
                    <option value={Tone.INSTITUCIONAL}>🏢 Institucional</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-3 cursor-pointer group p-3 bg-slate-900/50 rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-all">
                    <input 
                      type="checkbox" 
                      checked={state.strongCTA}
                      onChange={(e) => setState(prev => ({ ...prev, strongCTA: e.target.checked }))}
                      className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 accent-cyan-500"
                    />
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-widest">
                      CTA Forte
                    </span>
                  </label>
                </div>
              </div>

              {state.error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-xs flex items-center gap-2">
                  <span className="text-lg">⚠️</span> {state.error}
                </div>
              )}

              <button
                onClick={handleProcess}
                disabled={state.isLoading}
                className="w-full bg-gradient-to-r from-cyan-600 via-cyan-500 to-fuchsia-600 hover:from-cyan-400 hover:to-fuchsia-500 disabled:opacity-50 text-white font-black py-5 px-6 rounded-2xl transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs group"
              >
                {state.isLoading ? (
                  <span className="flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Processando...
                  </span>
                ) : (
                  <>
                    <span>Executar Nano Engine</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </>
                )}
              </button>
            </div>
          </section>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {state.isLoading ? (
            <div className="bg-slate-800/40 p-12 rounded-3xl border border-slate-700 h-full min-h-[600px] flex flex-col items-center justify-center text-center backdrop-blur-sm">
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-2 border-cyan-500/10 rounded-full"></div>
                <div className="absolute inset-0 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-4 border-2 border-fuchsia-500/10 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">Sincronizando Multimodalidade</h3>
              <p className="text-slate-500 max-w-sm mx-auto font-light leading-relaxed">
                Nossa engine Nano Banana está fundindo as características da sua referência com a estrutura do seu post base.
              </p>
            </div>
          ) : state.result ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700 ease-out">
              {/* Main Preview Card */}
              <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl group">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/80 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-black text-[10px] uppercase tracking-widest text-slate-400">Preview Feed Instagram</span>
                  </div>
                  <button 
                    onClick={() => {
                       if (state.editedImage) {
                        const link = document.createElement('a');
                        link.href = state.editedImage;
                        link.download = 'social-gen-nano.png';
                        link.click();
                       }
                    }}
                    className="text-[9px] font-black bg-white hover:bg-cyan-100 px-4 py-2 rounded-full text-slate-900 transition-all uppercase shadow-lg shadow-white/5"
                  >
                    Exportar PNG
                  </button>
                </div>
                
                <div className="relative aspect-square bg-black overflow-hidden">
                  {state.editedImage && (
                    <img src={state.editedImage} alt="Edited Post" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  )}
                  
                  {/* Headline Overlay with visual balance emphasis */}
                  {state.result.mainText && (
                    <div className="absolute inset-0 flex items-center justify-center p-12 pointer-events-none select-none">
                       <p className="text-white text-4xl md:text-6xl font-black text-center drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] uppercase tracking-tighter leading-[0.85] italic">
                        {state.result.mainText}
                       </p>
                    </div>
                  )}

                  {/* Strategic CTA Overlay (if active and returned) */}
                  {state.result.cta && (
                    <div className="absolute bottom-10 left-0 w-full flex justify-center pointer-events-none">
                      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full shadow-2xl">
                        <span className="text-white text-xs font-black tracking-[0.3em] uppercase">{state.result.cta}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Strategic Breakdown Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual Logic */}
                <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700 shadow-xl">
                  <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                    Lógica Visual
                  </h3>
                  <p className="text-slate-400 text-xs italic leading-relaxed border-l-2 border-cyan-500/30 pl-4 font-light">
                    "{state.result.visualPrompt}"
                  </p>
                </div>

                {/* Strategy Card */}
                <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700 shadow-xl">
                   <h3 className="text-[10px] font-black text-fuchsia-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500"></span>
                    Headline & Hook
                  </h3>
                   <p className="text-2xl font-black leading-none uppercase tracking-tighter mb-2 italic">{state.result.mainText}</p>
                   {state.result.cta && (
                    <div className="mt-4">
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 uppercase tracking-widest">
                        {state.result.cta}
                      </span>
                    </div>
                  )}
                </div>

                {/* Caption - Full Width */}
                <div className="md:col-span-2 bg-slate-800/80 p-8 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  </div>
                  <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4">Legenda Estratégica de Conversão</h3>
                  <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-700/50 whitespace-pre-wrap text-sm text-slate-300 leading-relaxed font-light font-serif italic">
                    {state.result.caption}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/20 border-2 border-dashed border-slate-800 p-20 rounded-3xl flex flex-col items-center justify-center text-center opacity-30 h-full min-h-[500px]">
              <div className="text-7xl mb-8 filter grayscale opacity-40">🤖</div>
              <h3 className="text-2xl font-black mb-3 uppercase tracking-widest">Aguardando Brainstorming</h3>
              <p className="text-slate-500 max-w-xs mx-auto font-light leading-relaxed">
                Configure os inputs à esquerda para iniciar a geração da sua próxima postagem de alta performance.
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="max-w-6xl mx-auto mt-20 pb-12 text-center border-t border-slate-800/50 pt-12">
        <p className="text-slate-600 text-[9px] uppercase tracking-[0.4em] font-black flex items-center justify-center gap-4">
          <span className="w-8 h-px bg-slate-800"></span>
          Powered by Gemini Nano & Flash Architectures
          <span className="w-8 h-px bg-slate-800"></span>
        </p>
      </footer>
    </div>
  );
};

export default App;
