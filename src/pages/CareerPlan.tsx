import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  CircleCheck,
  ClipboardCheck,
  Copy,
  FileText,
  Flame,
  Layers3,
  ListTodo,
  Mail,
  MessageSquare,
  PencilLine,
  Plus,
  Send,
  Target,
  TimerReset,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Reveal, ScrollDepth, TiltSurface } from '../components/Motion';

type Tab = 'today' | 'pipeline' | 'studio';
type ApplicationStatus = 'Saved' | 'Applied' | 'Interview' | 'Offer';

type CareerProfile = {
  role: string;
  industry: string;
  timeline: string;
  weeklyHours: string;
};

type PlanTask = {
  id: string;
  title: string;
  detail: string;
  completed: boolean;
};

type Application = {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  nextAction: string;
  date: string;
};

type Skill = {
  id: string;
  name: string;
  level: number;
  target: string;
};

type StarDraft = {
  situation: string;
  task: string;
  action: string;
  result: string;
};

const storagePrefix = 'hireme-career-plan-';

function useStoredState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = window.localStorage.getItem(`${storagePrefix}${key}`);
      return saved ? (JSON.parse(saved) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(`${storagePrefix}${key}`, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

const initialTasks: PlanTask[] = [
  { id: 'resume', title: 'Tailor your resume', detail: 'Match the target role language before applying.', completed: false },
  { id: 'questions', title: 'Rehearse two interview stories', detail: 'Use the STAR studio to make evidence easy to recall.', completed: false },
  { id: 'outreach', title: 'Send one warm outreach note', detail: 'Ask for context, not a job, and keep the ask specific.', completed: false },
  { id: 'followup', title: 'Review application follow-ups', detail: 'Move every active application to a clear next action.', completed: false },
];

const initialSkills: Skill[] = [
  { id: 'communication', name: 'Executive communication', level: 58, target: 'Deliver concise, evidence-led answers' },
  { id: 'interview', name: 'Interview narrative', level: 45, target: 'Build three reusable STAR stories' },
  { id: 'role', name: 'Role-specific depth', level: 64, target: 'Close the highest-signal technical gap' },
];

const initialApplications: Application[] = [
  { id: 'northstar', company: 'Northstar Systems', role: 'Software Engineer', status: 'Saved', nextAction: 'Tailor resume and submit', date: 'Today' },
  { id: 'meridian', company: 'Meridian Studio', role: 'Product Engineer', status: 'Applied', nextAction: 'Follow up on Thursday', date: '2 days ago' },
  { id: 'axis', company: 'Axis Labs', role: 'Frontend Engineer', status: 'Interview', nextAction: 'Practice product sense stories', date: 'This week' },
];

const interviewThemes = {
  leadership: [
    'Tell me about a time you aligned people who disagreed on a priority.',
    'Describe a decision you made with incomplete information.',
    'When did you influence a result without formal authority?',
  ],
  delivery: [
    'Walk me through a project you delivered under a tight deadline.',
    'Tell me about a technical trade-off you made and why.',
    'Describe a time you found and fixed a risk before it became a problem.',
  ],
  growth: [
    'What is the most useful feedback you have received, and what changed?',
    'Describe a skill you had to learn quickly to deliver a result.',
    'Tell me about a failure that changed how you work.',
  ],
};

const statusOrder: ApplicationStatus[] = ['Saved', 'Applied', 'Interview', 'Offer'];

function nextStatus(current: ApplicationStatus) {
  return statusOrder[(statusOrder.indexOf(current) + 1) % statusOrder.length];
}

export default function CareerPlan() {
  const [tab, setTab] = useState<Tab>('today');
  const [profile, setProfile] = useStoredState<CareerProfile>('profile', {
    role: 'Software Engineer',
    industry: 'Technology',
    timeline: '90 days',
    weeklyHours: '5',
  });
  const [tasks, setTasks] = useStoredState<PlanTask[]>('tasks', initialTasks);
  const [applications, setApplications] = useStoredState<Application[]>('applications', initialApplications);
  const [skills, setSkills] = useStoredState<Skill[]>('skills', initialSkills);
  const [starDraft, setStarDraft] = useStoredState<StarDraft>('star-draft', { situation: '', task: '', action: '', result: '' });
  const [newTask, setNewTask] = useState('');
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationDraft, setApplicationDraft] = useState({ company: '', role: '', nextAction: '' });
  const [theme, setTheme] = useState<keyof typeof interviewThemes>('delivery');
  const [outreach, setOutreach] = useStoredState('outreach', { person: '', company: '', context: '' });
  const [salary, setSalary] = useStoredState('salary', { target: '90000', offer: '0', location: 'Remote / Global' });
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [focusRunning, setFocusRunning] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const completedTasks = tasks.filter((task) => task.completed).length;
  const skillAverage = Math.round(skills.reduce((sum, skill) => sum + skill.level, 0) / skills.length);
  const readiness = Math.min(100, Math.round((completedTasks / Math.max(tasks.length, 1)) * 48 + skillAverage * 0.32 + Math.min(applications.length, 5) * 4));
  const activeApplications = applications.filter((application) => application.status !== 'Offer').length;
  const nextTask = tasks.find((task) => !task.completed);
  const starPartsComplete = Object.values(starDraft).filter((part) => part.trim().length >= 18).length;
  const focusLabel = `${String(Math.floor(focusSeconds / 60)).padStart(2, '0')}:${String(focusSeconds % 60).padStart(2, '0')}`;
  const isFocusActive = focusRunning && focusSeconds > 0;

  useEffect(() => {
    if (!isFocusActive) return;
    const timer = window.setTimeout(() => setFocusSeconds((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [isFocusActive, focusSeconds]);

  const addTask = () => {
    const title = newTask.trim();
    if (!title) return;
    setTasks((current) => [
      ...current,
      { id: `${Date.now()}`, title, detail: 'A focused action for this week.', completed: false },
    ]);
    setNewTask('');
  };

  const addApplication = () => {
    if (!applicationDraft.company.trim() || !applicationDraft.role.trim()) return;
    setApplications((current) => [
      {
        id: `${Date.now()}`,
        company: applicationDraft.company.trim(),
        role: applicationDraft.role.trim(),
        status: 'Saved',
        nextAction: applicationDraft.nextAction.trim() || 'Review application materials',
        date: 'Today',
      },
      ...current,
    ]);
    setApplicationDraft({ company: '', role: '', nextAction: '' });
    setShowApplicationForm(false);
  };

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied('Select and copy');
    }
  };

  const outreachDraft = `Hello ${outreach.person || '[Name]'},\n\nI’m preparing for ${profile.role} roles${outreach.company ? ` and have been following ${outreach.company}` : ''}. ${outreach.context || 'Your perspective on the team’s work would be valuable.'}\n\nWould you be open to a brief 15-minute conversation about the role, the work, and what strong candidates tend to demonstrate? I’ll come prepared and keep it focused.\n\nThank you,\n[Your name]`;
  const salaryGap = Math.max(0, Number(salary.target || 0) - Number(salary.offer || 0));

  return (
    <div className="page-shell career-plan-page text-white">
      <div className="page-frame relative z-10">
        <ScrollDepth>
          <div className="career-plan-hero surface p-6 sm:p-8 lg:p-10 border-white/10 bg-zinc-900/60 backdrop-blur-xl">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="page-intro mb-0">
                <div className="eyebrow mb-5"><Target className="h-3.5 w-3.5 text-white" /> Career operating plan</div>
                <h1 className="page-title max-w-[12ch]">Make your next move <span className="title-accent">deliberate.</span></h1>
                <p className="page-lede">A private planning room for the work between discovering an opportunity and earning the offer.</p>
              </div>
              <div className="grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/10 bg-black/40 px-2 py-3 text-center sm:min-w-[360px]">
                <div className="px-3"><p className="text-2xl font-bold text-white">{readiness}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-400">Readiness</p></div>
                <div className="px-3"><p className="text-2xl font-bold text-white">{activeApplications}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-400">Active paths</p></div>
                <div className="px-3"><p className="text-2xl font-bold text-white">{completedTasks}/{tasks.length}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-400">This week</p></div>
              </div>
            </div>
          </div>
        </ScrollDepth>

        <div className="career-plan-tabs mt-6" role="tablist" aria-label="Career plan sections">
          {([
            ['today', 'Today’s plan', ClipboardCheck],
            ['pipeline', 'Applications', BriefcaseBusiness],
            ['studio', 'Prep studio', BookOpenCheck],
          ] as const).map(([value, label, Icon]) => (
            <button key={value} role="tab" aria-selected={tab === value} onClick={() => setTab(value)} className={`career-plan-tab ${tab === value ? 'career-plan-tab--active' : ''}`}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {tab === 'today' && (
          <div className="mt-8 space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <Reveal>
                <TiltSurface className="surface h-full p-6 sm:p-8 border-white/10 bg-zinc-900/60 backdrop-blur-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow"><ListTodo className="h-3.5 w-3.5 text-white" /> Priority board</p>
                      <h2 className="mt-3 text-xl font-bold text-white">The work that earns momentum</h2>
                    </div>
                    <span className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white">{completedTasks}/{tasks.length} complete</span>
                  </div>
                  <div className="mt-6 divide-y divide-white/10">
                    {tasks.map((task) => (
                      <label key={task.id} className="group flex cursor-pointer gap-3 py-4 first:pt-0">
                        <input type="checkbox" checked={task.completed} onChange={() => setTasks((current) => current.map((item) => item.id === task.id ? { ...item, completed: !item.completed } : item))} className="mt-1 h-4 w-4 accent-white" />
                        <span className="flex-1">
                          <span className={`block text-sm font-semibold ${task.completed ? 'text-zinc-500 line-through' : 'text-white'}`}>{task.title}</span>
                          <span className="mt-1 block text-xs leading-5 text-zinc-400">{task.detail}</span>
                        </span>
                        {task.completed && <CircleCheck className="mt-0.5 h-4 w-4 text-white" />}
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2 border-t border-white/10 pt-5">
                    <input value={newTask} onChange={(event) => setNewTask(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addTask(); }} placeholder="Add a focused action" className="form-field min-w-0 flex-1 rounded-xl px-4 py-2.5 text-sm bg-black/60 border border-white/10" />
                    <button onClick={addTask} className="button-secondary rounded-xl px-4 text-sm font-semibold cursor-pointer"><Plus className="h-4 w-4" /></button>
                  </div>
                </TiltSurface>
              </Reveal>

              <Reveal>
                <div className="surface h-full p-6 sm:p-8 border-white/10 bg-zinc-900/60 backdrop-blur-xl">
                  <p className="eyebrow"><PencilLine className="h-3.5 w-3.5 text-white" /> Career direction</p>
                  <h2 className="mt-3 text-xl font-bold text-white">Set the brief once</h2>
                  <p className="mt-2 text-xs leading-5 text-zinc-400">Every planning prompt below adapts to this working context.</p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {([
                      ['role', 'Target role'],
                      ['industry', 'Industry'],
                      ['timeline', 'Decision horizon'],
                      ['weeklyHours', 'Hours / week'],
                    ] as const).map(([field, label]) => (
                      <label key={field} className="block">
                        <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">{label}</span>
                        <input value={profile[field]} onChange={(event) => setProfile((current) => ({ ...current, [field]: event.target.value }))} className="form-field w-full rounded-xl px-3 py-2.5 text-sm bg-black/60 border border-white/10 text-white" />
                      </label>
                    ))}
                  </div>
                  <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">Next best action</p>
                    <p className="mt-2 text-sm font-semibold text-white">{nextTask ? nextTask.title : 'Plan a targeted application review.'}</p>
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Reveal>
                <div className="surface h-full p-6 border-white/10 bg-zinc-900/60">
                  <div className="flex items-center justify-between"><p className="eyebrow"><BarChart3 className="h-3.5 w-3.5 text-white" /> Readiness signal</p><BadgeCheck className="h-5 w-5 text-white" /></div>
                  <div className="mt-5 flex items-end justify-between"><p className="text-5xl font-display text-white">{readiness}</p><p className="mb-1 text-xs text-zinc-400">of 100</p></div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-zinc-500 to-white" initial={{ width: 0 }} whileInView={{ width: `${readiness}%` }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
                  </div>
                  <p className="mt-4 text-xs leading-5 text-zinc-400">Calculated from your focused actions, skill roadmap, and active application pipeline.</p>
                </div>
              </Reveal>
              <Reveal>
                <div className="surface h-full p-6 border-white/10 bg-zinc-900/60">
                  <div className="flex items-center justify-between"><p className="eyebrow"><Flame className="h-3.5 w-3.5 text-white" /> Focus session</p><button onClick={() => { setFocusRunning(false); setFocusSeconds(25 * 60); }} className="text-zinc-400 hover:text-white cursor-pointer" aria-label="Reset focus timer"><TimerReset className="h-4 w-4" /></button></div>
                  <p className="mt-5 font-display text-5xl text-white tabular-nums">{focusLabel}</p>
                  <p className="mt-2 text-xs text-zinc-400">One protected block for your next career action.</p>
                  <button onClick={() => { if (focusSeconds === 0) setFocusSeconds(25 * 60); setFocusRunning((running) => !isFocusActive || !running); }} className="button-primary mt-5 w-full rounded-xl py-3.5 text-xs font-bold cursor-pointer">{isFocusActive ? 'Pause focus' : 'Start 25-minute focus'}</button>
                </div>
              </Reveal>
              <Reveal>
                <div className="surface h-full p-6 border-white/10 bg-zinc-900/60">
                  <p className="eyebrow"><Layers3 className="h-3.5 w-3.5 text-white" /> Skill roadmap</p>
                  <div className="mt-5 space-y-4">
                    {skills.map((skill) => (
                      <div key={skill.id}>
                        <div className="flex justify-between gap-3 text-xs">
                          <span className="font-semibold text-white">{skill.name}</span>
                          <button onClick={() => setSkills((current) => current.map((item) => item.id === skill.id ? { ...item, level: Math.min(100, item.level + 5) } : item))} className="text-zinc-400 hover:text-white cursor-pointer">+5%</button>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-white" style={{ width: `${skill.level}%` }} />
                        </div>
                        <p className="mt-1.5 text-[10px] leading-4 text-zinc-500">{skill.target}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        )}

        {tab === 'pipeline' && (
          <div className="mt-8 space-y-6">
            <Reveal>
              <div className="surface p-6 sm:p-8 border-white/10 bg-zinc-900/60 backdrop-blur-xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="eyebrow"><BriefcaseBusiness className="h-3.5 w-3.5 text-white" /> Application command board</p>
                    <h2 className="mt-3 text-xl font-bold text-white">Every opportunity needs a next move</h2>
                  </div>
                  <button onClick={() => setShowApplicationForm((visible) => !visible)} className="button-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-bold cursor-pointer"><Plus className="h-4 w-4" /> Add opportunity</button>
                </div>
                {showApplicationForm && (
                  <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-black/40 p-4 md:grid-cols-[1fr_1fr_1.3fr_auto]">
                    <input value={applicationDraft.company} onChange={(event) => setApplicationDraft((current) => ({ ...current, company: event.target.value }))} placeholder="Company" className="form-field rounded-xl px-3 py-2.5 text-sm bg-zinc-900 border border-white/10" />
                    <input value={applicationDraft.role} onChange={(event) => setApplicationDraft((current) => ({ ...current, role: event.target.value }))} placeholder="Role" className="form-field rounded-xl px-3 py-2.5 text-sm bg-zinc-900 border border-white/10" />
                    <input value={applicationDraft.nextAction} onChange={(event) => setApplicationDraft((current) => ({ ...current, nextAction: event.target.value }))} placeholder="Next action" className="form-field rounded-xl px-3 py-2.5 text-sm bg-zinc-900 border border-white/10" />
                    <button onClick={addApplication} className="button-secondary rounded-xl px-4 text-xs font-bold cursor-pointer">Save</button>
                  </div>
                )}
                <div className="mt-6 grid gap-4 lg:grid-cols-4">
                  {statusOrder.map((status) => (
                    <div key={status} className="rounded-xl border border-white/10 bg-black/40 p-3">
                      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">{status}</p>
                      <div className="space-y-3">
                        {applications.filter((application) => application.status === status).map((application) => (
                          <button key={application.id} onClick={() => setApplications((current) => current.map((item) => item.id === application.id ? { ...item, status: nextStatus(item.status) } : item))} className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-white/30 hover:bg-white/[0.06] cursor-pointer">
                            <div className="flex justify-between gap-2">
                              <p className="text-sm font-semibold text-white">{application.company}</p>
                              <ChevronRight className="h-4 w-4 text-zinc-500" />
                            </div>
                            <p className="mt-1 text-xs text-zinc-400">{application.role}</p>
                            <p className="mt-3 text-[10px] leading-4 text-white font-medium">{application.nextAction}</p>
                            <p className="mt-2 text-[9px] uppercase tracking-[0.12em] text-zinc-500">{application.date} · move to {nextStatus(application.status)}</p>
                          </button>
                        )) || <p className="rounded-lg border border-dashed border-white/10 p-3 text-center text-xs text-zinc-500">Nothing here yet</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <Reveal>
                <div className="surface h-full p-6 sm:p-8 border-white/10 bg-zinc-900/60 backdrop-blur-xl">
                  <p className="eyebrow"><Mail className="h-3.5 w-3.5 text-white" /> Follow-up composer</p>
                  <h2 className="mt-3 text-xl font-bold text-white">Send a measured next note</h2>
                  <p className="mt-2 text-xs leading-5 text-zinc-400">Use after an application or interview when the agreed date has passed.</p>
                  <textarea readOnly value={`Subject: Following up — ${profile.role} application\n\nHello [Name],\n\nI wanted to follow up on my application for the ${profile.role} role. I remain very interested in the opportunity and would be glad to provide any additional information.\n\nThank you for your time,\n[Your name]`} className="form-field mt-5 min-h-44 w-full resize-none rounded-xl p-4 text-sm leading-6 bg-black/60 border border-white/10 text-zinc-200" />
                  <button onClick={() => copy(`Subject: Following up — ${profile.role} application\n\nHello [Name],\n\nI wanted to follow up on my application for the ${profile.role} role. I remain very interested in the opportunity and would be glad to provide any additional information.\n\nThank you for your time,\n[Your name]`, 'Follow-up copied')} className="button-secondary mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold cursor-pointer"><Copy className="h-3.5 w-3.5" /> {copied === 'Follow-up copied' ? 'Copied' : 'Copy follow-up'}</button>
                </div>
              </Reveal>
              <Reveal>
                <div className="surface h-full p-6 sm:p-8 border-white/10 bg-zinc-900/60 backdrop-blur-xl">
                  <p className="eyebrow"><CalendarDays className="h-3.5 w-3.5 text-white" /> Weekly review</p>
                  <h2 className="mt-3 text-xl font-bold text-white">Close loops, then create new ones</h2>
                  <div className="mt-6 space-y-4">
                    {[['Applied this week', applications.filter((app) => app.status === 'Applied').length], ['Interviews to rehearse', applications.filter((app) => app.status === 'Interview').length], ['Open actions', tasks.filter((task) => !task.completed).length]].map(([label, value]) => (
                      <div key={label as string} className="flex items-center justify-between border-b border-white/10 pb-4">
                        <span className="text-sm text-zinc-300">{label}</span>
                        <span className="font-display text-2xl text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-5 text-xs leading-5 text-zinc-400">Review this panel at the end of each week, then make the next task small enough to start tomorrow.</p>
                </div>
              </Reveal>
            </div>
          </div>
        )}

        {tab === 'studio' && (
          <div className="mt-8 space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <Reveal>
                <TiltSurface className="surface h-full p-6 sm:p-8 border-white/10 bg-zinc-900/60 backdrop-blur-xl">
                  <p className="eyebrow"><MessageSquare className="h-3.5 w-3.5 text-white" /> Question library</p>
                  <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">Rehearse the signal behind the role</h2>
                      <p className="mt-2 text-xs text-zinc-400">Prompts selected for {profile.role} preparation.</p>
                    </div>
                    <select value={theme} onChange={(event) => setTheme(event.target.value as keyof typeof interviewThemes)} className="form-field rounded-xl px-3 py-2.5 text-sm bg-black/60 border border-white/10 text-white">
                      <option value="delivery">Delivery</option>
                      <option value="leadership">Leadership</option>
                      <option value="growth">Growth</option>
                    </select>
                  </div>
                  <div className="mt-6 space-y-3">
                    {interviewThemes[theme].map((question, index) => (
                      <div key={question} className="rounded-xl border border-white/10 bg-black/40 p-4">
                        <div className="flex gap-3">
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-[10px] font-bold text-white">0{index + 1}</span>
                          <p className="text-sm leading-6 text-zinc-200">{question}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link to="/interview" className="button-primary mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold no-underline text-black">Open live practice <ArrowRight className="h-3.5 w-3.5" /></Link>
                </TiltSurface>
              </Reveal>
              <Reveal>
                <div className="surface h-full p-6 sm:p-8 border-white/10 bg-zinc-900/60 backdrop-blur-xl">
                  <p className="eyebrow"><ClipboardCheck className="h-3.5 w-3.5 text-white" /> STAR answer studio</p>
                  <h2 className="mt-3 text-xl font-bold text-white">Build a story you can retrieve</h2>
                  <p className="mt-2 text-xs leading-5 text-zinc-400">Write the evidence, then practice delivering it naturally.</p>
                  <div className="mt-5 grid gap-3">
                    {(['situation', 'task', 'action', 'result'] as const).map((part) => (
                      <label key={part}>
                        <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">{part}</span>
                        <textarea value={starDraft[part]} onChange={(event) => setStarDraft((current) => ({ ...current, [part]: event.target.value }))} placeholder={`What was the ${part}?`} className="form-field h-16 w-full resize-none rounded-xl px-3 py-2 text-sm bg-black/60 border border-white/10 text-white" />
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-white/[0.04] p-3 border border-white/10">
                    <span className="text-xs text-zinc-400">Story completeness</span>
                    <span className="text-sm font-bold text-white">{starPartsComplete}/4</span>
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Reveal>
                <div className="surface h-full p-6 border-white/10 bg-zinc-900/60">
                  <p className="eyebrow"><Send className="h-3.5 w-3.5 text-white" /> Networking note</p>
                  <h2 className="mt-3 text-xl font-bold text-white">Ask for context, clearly</h2>
                  <div className="mt-5 space-y-3">
                    <input value={outreach.person} onChange={(event) => setOutreach((current) => ({ ...current, person: event.target.value }))} placeholder="Person’s name" className="form-field w-full rounded-xl px-3 py-2.5 text-sm bg-black/60 border border-white/10 text-white" />
                    <input value={outreach.company} onChange={(event) => setOutreach((current) => ({ ...current, company: event.target.value }))} placeholder="Company" className="form-field w-full rounded-xl px-3 py-2.5 text-sm bg-black/60 border border-white/10 text-white" />
                    <textarea value={outreach.context} onChange={(event) => setOutreach((current) => ({ ...current, context: event.target.value }))} placeholder="A specific reason for reaching out" className="form-field h-20 w-full resize-none rounded-xl px-3 py-2.5 text-sm bg-black/60 border border-white/10 text-white" />
                  </div>
                  <button onClick={() => copy(outreachDraft, 'Outreach copied')} className="button-secondary mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold cursor-pointer"><Copy className="h-3.5 w-3.5" /> {copied === 'Outreach copied' ? 'Copied' : 'Copy note'}</button>
                </div>
              </Reveal>
              <Reveal>
                <div className="surface h-full p-6 border-white/10 bg-zinc-900/60">
                  <p className="eyebrow"><CircleDollarSign className="h-3.5 w-3.5 text-white" /> Offer benchmark</p>
                  <h2 className="mt-3 text-xl font-bold text-white">Know your floor before the call</h2>
                  <div className="mt-5 space-y-3">
                    <label>
                      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">Target annual compensation</span>
                      <input inputMode="numeric" value={salary.target} onChange={(event) => setSalary((current) => ({ ...current, target: event.target.value }))} className="form-field w-full rounded-xl px-3 py-2.5 text-sm bg-black/60 border border-white/10 text-white" />
                    </label>
                    <label>
                      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">Current offer</span>
                      <input inputMode="numeric" value={salary.offer} onChange={(event) => setSalary((current) => ({ ...current, offer: event.target.value }))} className="form-field w-full rounded-xl px-3 py-2.5 text-sm bg-black/60 border border-white/10 text-white" />
                    </label>
                  </div>
                  <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-300">Negotiation gap</p>
                    <p className="mt-1 font-display text-3xl text-white">{salaryGap.toLocaleString()}</p>
                    <p className="mt-1 text-[10px] text-zinc-400">Use your total compensation context before negotiating.</p>
                  </div>
                </div>
              </Reveal>
              <Reveal>
                <div className="surface h-full p-6 border-white/10 bg-zinc-900/60">
                  <p className="eyebrow"><FileText className="h-3.5 w-3.5 text-white" /> Application positioning</p>
                  <h2 className="mt-3 text-xl font-bold text-white">Lead with relevant proof</h2>
                  <p className="mt-4 text-sm leading-6 text-zinc-300">“I’m a {profile.role} focused on turning complex work into clear outcomes for {profile.industry.toLowerCase()} teams.”</p>
                  <p className="mt-4 text-xs leading-5 text-zinc-400">Use this as a starting line for a cover letter, then ground it with results from your STAR evidence.</p>
                  <Link to="/resume" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-white no-underline hover:text-zinc-300">Tailor resume evidence <ChevronRight className="h-4 w-4" /></Link>
                </div>
              </Reveal>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
