import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Zap, BarChart3 } from 'lucide-react';
import Navbar from '../components/Navbar';
import AgentCard from '../components/AgentCard';

const stats = [
  { label: '22,000+ Branches' },
  { label: '40-60% Queue Reduction' },
  { label: '2 Min Loan Check' },
  { label: '3 AI Agents' },
];

const agents = [
  {
    icon: MessageCircle,
    title: 'Saarthi',
    description: 'WhatsApp-style AI that deflects branch visits',
    route: '/saarthi',
    accentColor: 'text-success',
  },
  {
    icon: Zap,
    title: 'SwiftDesk',
    description: 'In-branch kiosk for instant form fill & loan check',
    route: '/swiftdesk',
    accentColor: 'text-accent-gold',
  },
  {
    icon: BarChart3,
    title: 'BranchOS',
    description: 'Staff dashboard with footfall & server intelligence',
    route: '/branchos',
    accentColor: 'text-accent-blue',
  },
];

function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'SBI Setu — Bridging Customers to Banking';
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />

      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-accent-blue/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-accent-gold/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
            SBI Setu 🌉
          </h1>
          <h2 className="mb-6 text-xl font-semibold text-accent-gold sm:text-2xl lg:text-3xl">
            Aapke aur SBI ke beech ka Setu
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-text-muted sm:text-lg">
            Agentic AI platform that bridges customers to SBI banking — reducing
            branch queues through intelligent pre-visit deflection, in-branch
            automation, and real-time staff intelligence.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate('/saarthi')}
              className="w-full rounded-xl bg-accent-blue px-8 py-3.5 text-base font-semibold text-white shadow-blue-lg transition-default hover:bg-blue-600 sm:w-auto"
            >
              Try Saarthi →
            </button>
            <button
              type="button"
              onClick={() => navigate('/branchos')}
              className="w-full rounded-xl border-2 border-white/20 bg-transparent px-8 py-3.5 text-base font-semibold text-text-primary transition-default hover:border-accent-blue hover:bg-bg-card sm:w-auto"
            >
              View Dashboard
            </button>
          </div>
        </div>
      </section>

      <section className="border-y border-accent-gold/30 bg-bg-secondary py-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 sm:grid-cols-4 sm:gap-6 sm:px-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-sm font-bold text-accent-gold sm:text-base lg:text-lg">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <h2 className="mb-10 text-center text-2xl font-bold text-text-primary sm:text-3xl">
          Three AI Agents. One Smart Branch.
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard key={agent.title} {...agent} />
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 bg-bg-secondary py-8 text-center">
        <p className="text-sm text-text-muted sm:text-base">
          SBI Hackathon @ GFF 2026 | SBI Setu — Bridging customers to banking
        </p>
      </footer>
    </div>
  );
}

export default Landing;
