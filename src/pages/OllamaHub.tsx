import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, 
  Globe, 
  RefreshCw, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Download, 
  Layers, 
  Info,
  ChevronRight,
  Monitor
} from 'lucide-react';
import {
  getOllamaEndpoint,
  setOllamaEndpoint,
  getSelectedOllamaModel,
  setSelectedOllamaModel,
  checkOllamaStatus,
  pullOllamaModel
} from '../services/ollama';

export default function OllamaHub() {
  const [endpoint, setEndpointState] = useState(getOllamaEndpoint());
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModelState] = useState(getSelectedOllamaModel());
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [hardware, setHardware] = useState<any>(null);

  // Pull model states
  const [modelToPull, setModelToPull] = useState('');
  const [pulling, setPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [pullStatus, setPullStatus] = useState('');
  const [pullError, setPullError] = useState<string | null>(null);

  useEffect(() => {
    handleTestConnection();
    runHardwareBenchmark();
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestStatus('idle');
    try {
      setOllamaEndpoint(endpoint);
      const res = await checkOllamaStatus();
      if (res.status) {
        setModels(res.models);
        setTestStatus('success');
        
        // Match selection
        const current = getSelectedOllamaModel();
        if (res.models.length > 0) {
          if (!current || !res.models.includes(current)) {
            setSelectedModelState(res.models[0]);
            setSelectedOllamaModel(res.models[0]);
          } else {
            setSelectedModelState(current);
          }
        }
      } else {
        setTestStatus('error');
        setModels([]);
      }
    } catch {
      setTestStatus('error');
      setModels([]);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSelectModel = (modelName: string) => {
    setSelectedModelState(modelName);
    setSelectedOllamaModel(modelName);
  };

  const handlePullModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelToPull.trim()) return;

    setPulling(true);
    setPullError(null);
    setPullProgress(0);
    setPullStatus('Initializing pull request...');

    try {
      await pullOllamaModel(modelToPull.trim(), (status, progress) => {
        setPullStatus(status);
        setPullProgress(progress);
      });
      setPullStatus('Model pulled successfully!');
      setPullProgress(100);
      setModelToPull('');
      // Refresh models list
      handleTestConnection();
    } catch (err: any) {
      setPullError(err.message || 'Failed to pull model');
    } finally {
      setPulling(false);
    }
  };

  const runHardwareBenchmark = () => {
    const ram = (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : '8 GB (Estimated)';
    const ramValue = (navigator as any).deviceMemory || 8;
    const cores = navigator.hardwareConcurrency || 4;
    const hasWebGPU = !!(navigator as any).gpu;

    let recommendedModel = 'llama3.2:1b';
    let explanation = 'Suitable for lighter setups, ensuring smooth and responsive performance.';

    if (ramValue < 8 || cores < 6) {
      recommendedModel = 'qwen2.5:1.5b';
      explanation = 'Highly optimized for lower RAM capacities to maintain fast speed.';
    } else if (ramValue >= 16) {
      recommendedModel = 'qwen2.5-coder:7b';
      explanation = 'Advanced reasoning capability ideal for complex code suggestions and analytics.';
    } else {
      recommendedModel = 'llama3.2:3b';
      explanation = 'Balanced model for excellent text generation and semantic accuracy.';
    }

    setHardware({
      ram,
      cores,
      hasWebGPU,
      recommendedModel,
      explanation
    });
  };

  return (
    <div className="page-shell text-white relative overflow-hidden flex flex-col items-center">
      <div className="page-frame relative z-10 space-y-12">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-intro">
          <div className="eyebrow mb-5">
            <Cpu className="w-3.5 h-3.5 text-white" />
            Core AI Engine Layer
          </div>
          <h1 className="page-title mb-4">
            Local AI <span className="title-accent">Engine Hub</span>
          </h1>
          <p className="page-lede">Configure and benchmark the private on-device model engine that powers HireME intelligence.</p>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Connection configuration */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900/60 border border-white/10 rounded-[28px] p-8 backdrop-blur-xl relative overflow-hidden group shadow-2xl"
            >
              <h2 className="text-lg font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2.5">
                <Globe className="w-5 h-5 text-white" />
                Connection Control
              </h2>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Ollama API URL Endpoint</span>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={endpoint}
                      onChange={(e) => setEndpointState(e.target.value)}
                      placeholder="http://localhost:11434"
                      className="flex-1 bg-black/60 border border-white/10 rounded-xl px-5 py-3.5 text-xs text-white focus:outline-none focus:border-white font-mono transition-all"
                    />
                    <button
                      onClick={handleTestConnection}
                      disabled={isTesting}
                      className="px-6 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Server className="w-3.5 h-3.5" />}
                      Check Gateway
                    </button>
                  </div>
                </div>

                {testStatus !== 'idle' && (
                  <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs leading-normal transition-all ${
                    testStatus === 'success' 
                      ? 'bg-zinc-800/80 border-white/20 text-white' 
                      : 'bg-zinc-800/80 border-white/20 text-zinc-300'
                  }`}>
                    {testStatus === 'success' ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-white" />
                        <div>
                          <p className="font-bold">Gateway is Online</p>
                          <p className="text-[10px] text-zinc-400">Found {models.length} local models registered on endpoint.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 flex-shrink-0 text-zinc-400" />
                        <div>
                          <p className="font-bold">Gateway Offline</p>
                          <p className="text-[10px] text-zinc-400">Cannot resolve local port. Verify CORS and run settings.</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Model Library Puller */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-900/60 border border-white/10 rounded-[28px] p-8 backdrop-blur-xl relative overflow-hidden group shadow-2xl"
            >
              <h2 className="text-lg font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2.5">
                <Download className="w-5 h-5 text-white" />
                Model Registry Installer
              </h2>

              <form onSubmit={handlePullModel} className="space-y-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Enter Model Identifier</span>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={modelToPull}
                      onChange={(e) => setModelToPull(e.target.value)}
                      placeholder="llama3.2 or qwen2.5-coder:7b"
                      disabled={pulling}
                      className="flex-1 bg-black/60 border border-white/10 rounded-xl px-5 py-3.5 text-xs text-white focus:outline-none focus:border-white font-mono transition-all disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={pulling || !modelToPull.trim()}
                      className="px-6 rounded-xl bg-white hover:bg-zinc-200 text-black text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
                    >
                      {pulling ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                      Pull Model
                    </button>
                  </div>
                </div>

                {pulling && (
                  <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-white animate-pulse">{pullStatus}</span>
                      <span className="text-white font-mono">{pullProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white transition-all duration-300"
                        style={{ width: `${pullProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {pullStatus && !pulling && !pullError && (
                  <div className="p-4 rounded-xl bg-zinc-800/80 border border-white/20 text-white text-xs flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-white" />
                    <span>{pullStatus}</span>
                  </div>
                )}

                {pullError && (
                  <div className="p-4 rounded-xl bg-zinc-800/80 border border-white/20 text-zinc-300 text-xs flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-zinc-400" />
                    <span>{pullError}</span>
                  </div>
                )}
              </form>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Installed models list */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900/60 border border-white/10 rounded-[28px] p-8 backdrop-blur-xl relative overflow-hidden group shadow-2xl flex flex-col min-h-[350px]"
            >
              <h2 className="text-lg font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-white" />
                Model Directory ({models.length})
              </h2>

              <div className="flex-1 overflow-y-auto max-h-[220px] pr-2 space-y-2">
                {models.length > 0 ? (
                  models.map((modelName) => {
                    const isSelected = selectedModel === modelName;
                    return (
                      <button
                        key={modelName}
                        onClick={() => handleSelectModel(modelName)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer group/item ${
                          isSelected 
                            ? 'bg-white text-black border-white shadow-lg'
                            : 'bg-black/40 border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Cpu className={`w-4 h-4 ${isSelected ? 'text-black' : 'text-zinc-500 group-hover/item:text-white'}`} />
                          <span className="font-mono text-xs tracking-tight font-bold">{modelName}</span>
                        </div>
                        {isSelected ? (
                          <span className="text-[8px] font-black uppercase tracking-widest bg-black text-white px-2 py-0.5 rounded">ACTIVE</span>
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover/item:text-white transition-all transform group-hover/item:translate-x-0.5" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-2xl">
                    <AlertCircle className="w-8 h-8 text-zinc-600 mb-2" />
                    <p className="text-xs text-zinc-500 italic">No models registered. Run connection check or pull a new model.</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Hardware compatibility benchmarking */}
            {hardware && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-zinc-900/60 border border-white/10 rounded-[28px] p-8 backdrop-blur-xl relative overflow-hidden group shadow-2xl"
              >
                <h2 className="text-lg font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2.5">
                  <Info className="w-5 h-5 text-white" />
                  Hardware Advisor
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-black/60 p-4 border border-white/10 rounded-2xl flex flex-col gap-1">
                      <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Memory RAM</span>
                      <span className="font-mono font-bold text-white flex items-center gap-1.5">
                        <Monitor className="w-3.5 h-3.5 text-white" />
                        {hardware.ram}
                      </span>
                    </div>
                    <div className="bg-black/60 p-4 border border-white/10 rounded-2xl flex flex-col gap-1">
                      <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">CPU Threads</span>
                      <span className="font-mono font-bold text-white flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-white" />
                        {hardware.cores} cores
                      </span>
                    </div>
                  </div>

                  <div className="bg-black/60 p-4 border border-white/10 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      <span>Recommendation Node</span>
                      <span className="text-white font-mono font-bold">{hardware.recommendedModel}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed">{hardware.explanation}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Automatic execution guide */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900/60 border border-white/10 rounded-[28px] p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl"
        >
          <h2 className="text-lg font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-white" />
            Automatic Execution & CORS Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed">
            <div className="space-y-4">
              <h3 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                1. Enable CORS Origins
              </h3>
              <p className="text-zinc-400">
                To allow the browser client to communicate directly with your local Ollama port without security blocks, set the wildcard origin environment variable:
              </p>
              <div className="bg-black/60 p-4 rounded-xl border border-white/10 font-mono text-[10px] text-zinc-300 select-all">
                OLLAMA_ORIGINS="*" ollama serve
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                2. Auto Run at Startup
              </h3>
              <p className="text-zinc-400">
                Create a local launch script to automatically set configurations and start Ollama alongside your dev environment:
              </p>
              <div className="bg-black/60 p-4 rounded-xl border border-white/10 font-mono text-[9px] text-zinc-300 select-all leading-normal whitespace-pre">
{`#!/bin/bash
export OLLAMA_ORIGINS="*"
ollama serve &
npm run dev`}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
