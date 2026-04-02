'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Monitor,
  Zap,
  Settings,
  CreditCard,
  ChevronRight,
  Send,
  Bot,
  Globe,
  Code,
  FileText,
  Mail,
  Search,
  Loader2,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  Plug,
  Wrench,
  SlidersHorizontal,
  X,
  Menu,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SubAgent {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'pending' | 'running' | 'completed';
  description: string;
  result?: string;
}

interface TaskStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed';
  subAgents: SubAgent[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  taskSteps?: TaskStep[];
  isStreaming?: boolean;
}

// ─── Demo data ───────────────────────────────────────────────────────────────

const DEMO_TASK_STEPS: TaskStep[] = [
  {
    id: 'step-1',
    label: 'Understanding your request',
    status: 'completed',
    subAgents: [
      {
        id: 'sa-1',
        name: 'Intent Parser',
        icon: <Sparkles size={14} />,
        status: 'completed',
        description: 'Analyzing task requirements and constraints',
        result: 'Identified: competitive analysis report with pricing data',
      },
    ],
  },
  {
    id: 'step-2',
    label: 'Researching competitor data',
    status: 'completed',
    subAgents: [
      {
        id: 'sa-2',
        name: 'Web Researcher',
        icon: <Globe size={14} />,
        status: 'completed',
        description: 'Searching for competitor pricing pages',
        result: 'Found pricing data for 5 competitors',
      },
      {
        id: 'sa-3',
        name: 'Data Extractor',
        icon: <Search size={14} />,
        status: 'completed',
        description: 'Extracting structured pricing information',
        result: 'Extracted 23 pricing tiers across competitors',
      },
    ],
  },
  {
    id: 'step-3',
    label: 'Building the report',
    status: 'running',
    subAgents: [
      {
        id: 'sa-4',
        name: 'Document Builder',
        icon: <FileText size={14} />,
        status: 'running',
        description: 'Generating comparison tables and analysis',
      },
      {
        id: 'sa-5',
        name: 'Code Agent',
        icon: <Code size={14} />,
        status: 'pending',
        description: 'Creating interactive pricing chart',
      },
    ],
  },
  {
    id: 'step-4',
    label: 'Delivering results',
    status: 'pending',
    subAgents: [
      {
        id: 'sa-6',
        name: 'Email Agent',
        icon: <Mail size={14} />,
        status: 'pending',
        description: 'Sending report to your inbox',
      },
    ],
  },
];

const EXAMPLE_PROMPTS = [
  'Research my top 5 competitors and build a pricing comparison report',
  'Find 50 leads in Atlanta that match my ideal customer profile',
  'Build a landing page for my new product launch',
  'Analyze my website performance and suggest SEO improvements',
];

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', active: true },
    { icon: <Plug size={18} />, label: 'Connectors', active: false },
    { icon: <Wrench size={18} />, label: 'Skills', active: false },
    { icon: <SlidersHorizontal size={18} />, label: 'Custom Instructions', active: false },
    { icon: <Settings size={18} />, label: 'Settings', active: false },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-[260px] bg-[#111111] border-r border-white/[0.06]
          flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center justify-between border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <Monitor size={16} className="text-white" />
            </div>
            <span className="text-[15px] font-semibold text-white tracking-[-0.3px]">
              Computer
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-white/40 hover:text-white/70 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium
                transition-all duration-150
                ${
                  item.active
                    ? 'bg-white/[0.08] text-white'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                }
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Credits */}
        <div className="px-4 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 text-white/30 text-[12px] mb-2">
            <CreditCard size={14} />
            <span>Credits</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full w-[72%] bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
          </div>
          <div className="flex justify-between mt-1.5 text-[11px] text-white/25">
            <span>72 / 100 remaining</span>
            <span>Pro</span>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Sub-agent card ──────────────────────────────────────────────────────────

function SubAgentCard({ agent }: { agent: SubAgent }) {
  return (
    <div
      className={`
        flex items-start gap-3 px-3.5 py-3 rounded-xl border transition-all duration-500
        ${
          agent.status === 'running'
            ? 'bg-cyan-500/[0.06] border-cyan-500/20'
            : agent.status === 'completed'
            ? 'bg-emerald-500/[0.04] border-emerald-500/10'
            : 'bg-white/[0.02] border-white/[0.06]'
        }
      `}
    >
      <div
        className={`
          mt-0.5 w-6 h-6 rounded-md flex items-center justify-center shrink-0
          ${
            agent.status === 'running'
              ? 'bg-cyan-500/20 text-cyan-400'
              : agent.status === 'completed'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-white/[0.06] text-white/30'
          }
        `}
      >
        {agent.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-[13px] font-medium ${
              agent.status === 'running'
                ? 'text-cyan-300'
                : agent.status === 'completed'
                ? 'text-emerald-300'
                : 'text-white/40'
            }`}
          >
            {agent.name}
          </span>
          {agent.status === 'running' && (
            <Loader2 size={12} className="text-cyan-400 animate-spin" />
          )}
          {agent.status === 'completed' && (
            <CheckCircle2 size={12} className="text-emerald-400" />
          )}
        </div>
        <p className="text-[12px] text-white/30 mt-0.5 leading-relaxed">
          {agent.description}
        </p>
        {agent.result && (
          <p className="text-[12px] text-emerald-400/70 mt-1.5 leading-relaxed">
            {agent.result}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Task step ───────────────────────────────────────────────────────────────

function TaskStepView({ step, isLast }: { step: TaskStep; isLast: boolean }) {
  return (
    <div className="relative">
      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-[11px] top-[28px] bottom-0 w-px bg-white/[0.06]" />
      )}
      <div className="flex items-start gap-3">
        {/* Status dot */}
        <div className="mt-1 shrink-0">
          {step.status === 'completed' ? (
            <CheckCircle2 size={22} className="text-emerald-400" />
          ) : step.status === 'running' ? (
            <div className="relative">
              <Circle size={22} className="text-cyan-400" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              </div>
            </div>
          ) : (
            <Circle size={22} className="text-white/15" />
          )}
        </div>
        {/* Step content */}
        <div className="flex-1 pb-6">
          <p
            className={`text-[14px] font-medium mb-3 ${
              step.status === 'completed'
                ? 'text-emerald-300'
                : step.status === 'running'
                ? 'text-white'
                : 'text-white/30'
            }`}
          >
            {step.label}
          </p>
          <div className="space-y-2">
            {step.subAgents.map((agent) => (
              <SubAgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Welcome screen ──────────────────────────────────────────────────────────

function WelcomeScreen({ onSelectPrompt }: { onSelectPrompt: (prompt: string) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/20">
        <Bot size={28} className="text-white" />
      </div>
      <h1 className="text-[28px] sm:text-[36px] font-semibold text-white tracking-[-0.8px] mb-3 text-center">
        What do you want to get done?
      </h1>
      <p className="text-[15px] text-white/40 max-w-[460px] text-center leading-relaxed mb-10">
        Describe a task and Computer will break it down, delegate to specialized agents, and deliver the result.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[640px] w-full">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelectPrompt(prompt)}
            className="
              group text-left px-4 py-3.5 rounded-xl border border-white/[0.06]
              bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12]
              transition-all duration-200 cursor-pointer
            "
          >
            <span className="text-[13px] text-white/50 group-hover:text-white/70 leading-relaxed transition-colors">
              {prompt}
            </span>
            <ArrowRight
              size={14}
              className="mt-2 text-white/15 group-hover:text-cyan-400 transition-colors"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main interface ──────────────────────────────────────────────────────────

export default function ComputerInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSteps, setActiveSteps] = useState<TaskStep[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  // Scroll output to bottom when steps update
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [activeSteps]);

  // Simulate streaming task execution
  const runTask = useCallback(async (prompt: string) => {
    setIsRunning(true);
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: prompt },
      { role: 'assistant', content: '', isStreaming: true },
    ]);

    // Clone demo steps and reset them all to pending
    const steps: TaskStep[] = DEMO_TASK_STEPS.map((s) => ({
      ...s,
      status: 'pending' as const,
      subAgents: s.subAgents.map((a) => ({ ...a, status: 'pending' as const, result: undefined })),
    }));

    setActiveSteps([...steps]);

    // Simulate step-by-step execution with delays
    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 800));
      steps[i].status = 'running';
      setActiveSteps([...steps.map((s) => ({ ...s, subAgents: [...s.subAgents] }))]);

      for (let j = 0; j < steps[i].subAgents.length; j++) {
        await new Promise((r) => setTimeout(r, 600));
        steps[i].subAgents[j].status = 'running';
        setActiveSteps([...steps.map((s) => ({ ...s, subAgents: [...s.subAgents] }))]);

        await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
        steps[i].subAgents[j].status = 'completed';
        steps[i].subAgents[j].result =
          DEMO_TASK_STEPS[i].subAgents[j].result ?? 'Done';
        setActiveSteps([...steps.map((s) => ({ ...s, subAgents: [...s.subAgents] }))]);
      }

      steps[i].status = 'completed';
      setActiveSteps([...steps.map((s) => ({ ...s, subAgents: [...s.subAgents] }))]);
    }

    // Finish
    setMessages((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last.role === 'assistant') {
        last.isStreaming = false;
        last.content =
          'Your competitive analysis report is ready. I found pricing data for 5 competitors across 23 pricing tiers, built comparison tables, and the report has been sent to your inbox.';
        last.taskSteps = steps;
      }
      return updated;
    });
    setIsRunning(false);
  }, []);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isRunning) return;
    setInput('');
    runTask(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="h-screen flex bg-[#0a0a0a] text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-[52px] border-b border-white/[0.06] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-md text-white/40 hover:text-white/70 transition-colors"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2 text-white/50 text-[13px]">
              <Zap size={14} className="text-cyan-400" />
              <span className="hidden sm:inline">Computer</span>
              {isRunning && (
                <>
                  <ChevronRight size={12} className="text-white/20" />
                  <span className="text-cyan-400 flex items-center gap-1.5">
                    <Loader2 size={12} className="animate-spin" />
                    Running task...
                  </span>
                </>
              )}
            </div>
          </div>
          <button className="text-[12px] text-white/30 hover:text-white/50 transition-colors px-3 py-1.5 rounded-md border border-white/[0.06] hover:border-white/[0.12]">
            Usage
          </button>
        </header>

        {/* Content area — two panels when task is running */}
        <div className="flex-1 flex min-h-0">
          {/* Left panel: chat / welcome */}
          <div
            className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ${
              hasMessages && activeSteps.length > 0 ? 'lg:w-1/2' : 'w-full'
            }`}
          >
            {!hasMessages ? (
              <WelcomeScreen
                onSelectPrompt={(p) => {
                  setInput('');
                  runTask(p);
                }}
              />
            ) : (
              /* Message history */
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
                {messages.map((msg, i) => (
                  <div key={i} className="max-w-[680px] mx-auto">
                    {msg.role === 'user' ? (
                      <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[12px] font-medium text-white/60">Y</span>
                        </div>
                        <p className="text-[14px] text-white/80 leading-relaxed pt-1">
                          {msg.content}
                        </p>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles size={13} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          {msg.isStreaming ? (
                            <div className="flex items-center gap-2 text-white/40 text-[14px]">
                              <Loader2 size={14} className="animate-spin text-cyan-400" />
                              Working on your task...
                            </div>
                          ) : (
                            <p className="text-[14px] text-white/70 leading-relaxed">
                              {msg.content}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Input area */}
            <div className="shrink-0 px-4 sm:px-6 pb-5 pt-2">
              <div className="max-w-[680px] mx-auto">
                <div
                  className={`
                    relative rounded-2xl border transition-all duration-200
                    ${
                      input
                        ? 'border-cyan-500/30 bg-white/[0.04] shadow-[0_0_20px_rgba(34,211,238,0.04)]'
                        : 'border-white/[0.08] bg-white/[0.02]'
                    }
                  `}
                >
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Computer..."
                    disabled={isRunning}
                    rows={1}
                    className="
                      w-full bg-transparent text-[14px] text-white/90 placeholder:text-white/25
                      px-4 py-3.5 pr-12 resize-none outline-none
                      disabled:opacity-40 disabled:cursor-not-allowed
                    "
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!input.trim() || isRunning}
                    className="
                      absolute right-3 bottom-3 w-8 h-8 rounded-lg
                      bg-cyan-500 hover:bg-cyan-400 disabled:bg-white/[0.06]
                      flex items-center justify-center
                      transition-all duration-150
                      disabled:cursor-not-allowed
                    "
                  >
                    <Send
                      size={14}
                      className={`${
                        input.trim() && !isRunning ? 'text-white' : 'text-white/20'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-white/15 text-center mt-2.5">
                  Computer runs tasks asynchronously. You can close this tab and come back later.
                </p>
              </div>
            </div>
          </div>

          {/* Right panel: sub-agent dashboard (visible when task is running / has results) */}
          {activeSteps.length > 0 && (
            <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] border-l border-white/[0.06] flex-col shrink-0">
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
                <Bot size={16} className="text-cyan-400" />
                <span className="text-[13px] font-medium text-white/70">
                  Sub-Agent Dashboard
                </span>
                {isRunning && (
                  <span className="ml-auto text-[11px] text-cyan-400/60 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    Live
                  </span>
                )}
              </div>
              <div ref={outputRef} className="flex-1 overflow-y-auto px-5 py-5">
                {activeSteps.map((step, i) => (
                  <TaskStepView
                    key={step.id}
                    step={step}
                    isLast={i === activeSteps.length - 1}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
