import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Bot, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const WELCOME_MESSAGE =
  'Namaste! 🙏 Main SBI Saarthi hun. Aapki banking queries mein help karne ke liye yahan hun. Branch visit karne se pehle mujhse poochhen — kaafi kaam ghar se ho sakta hai! Aap kya jaanna chahte hain?';

function LoanEligibilityForm() {
  const [income, setIncome] = useState('');
  const [existingEmis, setExistingEmis] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [tenure, setTenure] = useState('60');
  const [result, setResult] = useState(null);

  useEffect(() => {
    const inc = parseFloat(income) || 0;
    const emis = parseFloat(existingEmis) || 0;
    const amount = parseFloat(loanAmount) || 0;

    if (inc <= 0 || amount <= 0) {
      setResult(null);
      return;
    }

    const monthlyEmi = amount * 0.009;
    const eligible = (inc - emis) * 0.4 >= monthlyEmi;

    if (eligible) {
      setResult({
        eligible: true,
        message: `Aap ₹${(amount / 100000).toFixed(2)} lakh ke loan ke liye eligible hain! Token generate karein.`,
      });
    } else {
      const requiredIncome = (monthlyEmi / 0.4) + emis;
      setResult({
        eligible: false,
        message: `Current income ke saath ye loan possible nahi. ₹${Math.ceil(requiredIncome).toLocaleString('en-IN')} income chahiye.`,
      });
    }
  }, [income, existingEmis, loanAmount, tenure]);

  return (
    <div className="mt-3 rounded-xl border border-accent-blue/30 bg-bg-secondary p-4">
      <p className="mb-3 text-sm font-semibold text-accent-gold">
        Loan Eligibility Check
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-text-muted">Monthly Income (₹)</label>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-bg-card px-3 py-2 text-sm text-white focus:border-accent-blue focus:outline-none"
            placeholder="50000"
            min="0"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-text-muted">Existing EMIs (₹)</label>
          <input
            type="number"
            value={existingEmis}
            onChange={(e) => setExistingEmis(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-bg-card px-3 py-2 text-sm text-white focus:border-accent-blue focus:outline-none"
            placeholder="10000"
            min="0"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-text-muted">Loan Amount (₹)</label>
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-bg-card px-3 py-2 text-sm text-white focus:border-accent-blue focus:outline-none"
            placeholder="500000"
            min="0"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-text-muted">Tenure (months)</label>
          <input
            type="number"
            value={tenure}
            onChange={(e) => setTenure(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-bg-card px-3 py-2 text-sm text-white focus:border-accent-blue focus:outline-none"
            placeholder="60"
            min="12"
            max="360"
          />
        </div>
      </div>
      {result && (
        <div
          className={`mt-3 rounded-lg p-3 text-sm font-medium ${
            result.eligible
              ? 'bg-success/20 text-success'
              : 'bg-danger/20 text-danger'
          }`}
        >
          {result.eligible ? '✅ ELIGIBLE — ' : '❌ NOT ELIGIBLE — '}
          {result.message}
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-blue">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="rounded-xl rounded-bl-sm bg-bg-card px-4 py-3">
        <div className="flex gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-text-muted [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-text-muted [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-text-muted [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

function Saarthi() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const chatEndRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    document.title = 'Saarthi — SBI Setu';
  }, []);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      setMessages([
        {
          id: 1,
          role: 'assistant',
          content: WELCOME_MESSAGE,
        },
      ]);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setError('');
    const userMsg = { id: Date.now(), role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content }));

      const payload = { message: trimmed, history };
      if (sessionId) payload.session_id = sessionId;

      const response = await axios.post(`${API_URL}/api/saarthi/chat`, payload);

      if (response.data.session_id) {
        setSessionId(response.data.session_id);
      }

      const intent = response.data.intent || '';
      const botMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data.reply,
        showBookToken: intent === 'cash',
        showLoanForm: intent === 'loan',
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        'Maaf kijiye, kuch gadbad ho gayi. Kripya dobara try karein.';
      setError(typeof detail === 'string' ? detail : 'Server error. Please try again.');
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content:
            'Maaf kijiye, abhi main respond nahi kar pa raha. Kripya thodi der baad try karein ya YONO app use karein.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-bg-primary">
      <header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-bg-secondary px-4 py-4 sm:px-6">
        <Link
          to="/"
          className="rounded-lg p-2 text-text-muted transition-default hover:bg-bg-card hover:text-white"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-text-primary sm:text-xl">
            Saarthi — SBI AI Assistant
          </h1>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-text-muted">Online</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.role === 'user' ? (
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-xl rounded-br-sm bg-accent-blue px-4 py-3 text-sm text-white sm:text-base">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-blue">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="max-w-[85%]">
                    <div className="rounded-xl rounded-bl-sm bg-bg-card px-4 py-3 text-sm text-white sm:text-base">
                      {msg.content}
                    </div>
                    {msg.showBookToken && (
                      <Link
                        to="/swiftdesk"
                        className="mt-2 inline-block rounded-lg bg-accent-gold px-4 py-2 text-sm font-semibold text-bg-primary transition-default hover:bg-yellow-500"
                      >
                        Book Token
                      </Link>
                    )}
                    {msg.showLoanForm && <LoanEligibilityForm />}
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && <TypingIndicator />}
          <div ref={chatEndRef} />
        </div>
      </div>

      {error && (
        <div className="mx-4 mb-2 rounded-lg bg-danger/20 px-4 py-2 text-sm text-danger sm:mx-6">
          {error}
        </div>
      )}

      <form
        onSubmit={sendMessage}
        className="shrink-0 border-t border-white/10 bg-bg-secondary px-4 py-4 sm:px-6"
      >
        <div className="mx-auto flex max-w-2xl gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Apna sawaal likhein..."
            className="flex-1 rounded-xl border border-white/10 bg-bg-card px-4 py-3 text-base text-white placeholder:text-text-muted focus:border-accent-blue focus:outline-none"
            disabled={loading}
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-blue text-white transition-default hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default Saarthi;
