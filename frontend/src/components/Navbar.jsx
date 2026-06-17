import { Link, useLocation } from 'react-router-dom';
import { Building2 } from 'lucide-react';

const navLinks = [
  { to: '/saarthi', label: 'Saarthi' },
  { to: '/swiftdesk', label: 'SwiftDesk' },
  { to: '/branchos', label: 'BranchOS' },
];

function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-bg-primary/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 transition-default hover:opacity-90"
        >
          <Building2 className="h-7 w-7 text-accent-blue" />
          <span className="text-lg font-bold text-text-primary sm:text-xl">
            SBI Setu
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-lg px-2 py-2 text-sm font-medium transition-default sm:px-4 sm:text-base ${
                location.pathname === link.to
                  ? 'bg-accent-blue text-white'
                  : 'text-text-muted hover:bg-bg-card hover:text-text-primary'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
