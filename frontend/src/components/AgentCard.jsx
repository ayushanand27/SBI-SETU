import { useNavigate } from 'react-router-dom';

function AgentCard({ icon: Icon, title, description, route, accentColor = 'text-accent-blue' }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(route)}
      className="group w-full rounded-xl border border-white/10 bg-bg-card p-6 text-left shadow-blue-lg transition-default hover:scale-105 hover:border-accent-blue/50 hover:shadow-blue-lg focus:outline-none focus:ring-2 focus:ring-accent-blue sm:p-8"
    >
      <div
        className={`mb-4 inline-flex rounded-xl bg-bg-secondary p-3 ${accentColor}`}
      >
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="mb-2 text-xl font-bold text-text-primary">{title}</h3>
      <p className="text-sm leading-relaxed text-text-muted sm:text-base">
        {description}
      </p>
      <span className="mt-4 inline-block text-sm font-medium text-accent-blue opacity-0 transition-default group-hover:opacity-100">
        Explore →
      </span>
    </button>
  );
}

export default AgentCard;
