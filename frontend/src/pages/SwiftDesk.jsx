import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Wallet,
  FileText,
  BookOpen,
  Check,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SERVICES = [
  {
    id: 'account',
    title: 'Account Opening',
    emoji: '🏦',
    icon: Building2,
    wait: '~12 min',
    apiKey: 'account',
  },
  {
    id: 'loan',
    title: 'Loan Application',
    emoji: '💰',
    icon: Wallet,
    wait: '~8 min',
    apiKey: 'loan',
  },
  {
    id: 'kyc',
    title: 'KYC Update',
    emoji: '📋',
    icon: FileText,
    wait: '~7 min',
    apiKey: 'kyc',
  },
  {
    id: 'passbook',
    title: 'Passbook Update',
    emoji: '📗',
    icon: BookOpen,
    wait: '~10 min',
    apiKey: 'passbook',
  },
];

const STEPS = ['Select Service', 'Fill Details', 'Eligibility', 'Token'];

function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-success px-6 py-3 text-sm font-medium text-white shadow-lg">
      {message}
      <button
        type="button"
        onClick={onClose}
        className="ml-3 text-white/80 hover:text-white"
        aria-label="Close toast"
      >
        ✕
      </button>
    </div>
  );
}

function StepIndicator({ currentStep }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2 sm:gap-4">
      {STEPS.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = currentStep === stepNum;
        const isDone = currentStep > stepNum;
        return (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-default sm:h-12 sm:w-12 sm:text-base ${
                isDone
                  ? 'bg-success text-white'
                  : isActive
                    ? 'bg-accent-blue text-white'
                    : 'bg-bg-card text-text-muted'
              }`}
            >
              {isDone ? <Check className="h-5 w-5" /> : stepNum}
            </div>
            <span
              className={`hidden text-sm sm:inline ${
                isActive ? 'font-semibold text-white' : 'text-text-muted'
              }`}
            >
              {label}
            </span>
            {idx < STEPS.length - 1 && (
              <div
                className={`hidden h-0.5 w-8 sm:block sm:w-12 ${
                  currentStep > stepNum ? 'bg-success' : 'bg-bg-card'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SwiftDesk() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    aadhaarLast4: '',
    pan: '',
    mobile: '',
    monthlyIncome: '',
    existingEmis: '',
  });
  const [loanEligibility, setLoanEligibility] = useState({
    loanAmount: '',
    tenure: '60',
    income: '',
    existingEmis: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [sessionTokens] = useState(() => new Set());
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  useEffect(() => {
    document.title = 'SwiftDesk — SBI Setu';
  }, []);

  const eligibilityResult = useMemo(() => {
    const income = parseFloat(loanEligibility.income) || 0;
    const emis = parseFloat(loanEligibility.existingEmis) || 0;
    const amount = parseFloat(loanEligibility.loanAmount) || 0;

    if (income <= 0 || amount <= 0) return null;

    const monthlyEmi = amount * 0.009;
    const eligible = (income - emis) * 0.4 >= monthlyEmi;

    if (eligible) {
      return {
        eligible: true,
        message: `Aap ₹${(amount / 100000).toFixed(2)} lakh ke loan ke liye eligible hain! Token generate karein.`,
      };
    }
    const requiredIncome = (monthlyEmi / 0.4) + emis;
    return {
      eligible: false,
      message: `Current income ke saath ye loan possible nahi. ₹${Math.ceil(requiredIncome).toLocaleString('en-IN')} income chahiye.`,
    };
  }, [loanEligibility]);

  const validateForm = () => {
    const errors = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      errors.fullName = 'Valid full name required';
    }
    if (!/^\d{4}$/.test(form.aadhaarLast4)) {
      errors.aadhaarLast4 = 'Enter last 4 digits of Aadhaar';
    }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan.toUpperCase())) {
      errors.pan = 'Valid PAN required (e.g. ABCDE1234F)';
    }
    if (!/^\d{10}$/.test(form.mobile)) {
      errors.mobile = 'Valid 10-digit mobile required';
    }
    if (selectedService?.id === 'loan') {
      if (!form.monthlyIncome || parseFloat(form.monthlyIncome) <= 0) {
        errors.monthlyIncome = 'Valid income required';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setStep(2);
    setError('');
    setOtpSent(false);
    setOtp('');
    setOtpVerified(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateForm() || !otpVerified) return;

    if (selectedService?.id === 'loan') {
      setLoanEligibility((prev) => ({
        ...prev,
        income: form.monthlyIncome,
        existingEmis: form.existingEmis || '0',
      }));
      setStep(3);
    } else {
      generateToken();
    }
  };

  const generateToken = async () => {
    setLoading(true);
    setError('');
    try {
      let tokenPayload = null;
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const response = await axios.post(`${API_URL}/api/swiftdesk/token`, {
          service: selectedService.apiKey,
          name: form.fullName.trim(),
          aadhaar_last4: form.aadhaarLast4 || null,
        }, { timeout: 90000 });
        const token = response.data.token;
        if (!sessionTokens.has(token)) {
          sessionTokens.add(token);
          tokenPayload = response.data;
          break;
        }
      }

      if (!tokenPayload) {
        setError('Unable to generate a unique token. Please try again.');
        return;
      }

      setTokenData(tokenPayload);
      setStep(4);
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Failed to generate token. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDigiLocker = () => {
    setForm({
      fullName: 'Rahul Sharma',
      aadhaarLast4: '4521',
      pan: 'ABCDE1234F',
      mobile: '9876543210',
      monthlyIncome: form.monthlyIncome,
      existingEmis: form.existingEmis,
    });
    setToast('DigiLocker data imported successfully!');
    setTimeout(() => setToast(''), 3000);
  };

  const handleSmsToken = () => {
    setToast(`Token sent to ${form.mobile}`);
    setTimeout(() => setToast(''), 3000);
  };

  const startOver = () => {
    setStep(1);
    setSelectedService(null);
    setForm({
      fullName: '',
      aadhaarLast4: '',
      pan: '',
      mobile: '',
      monthlyIncome: '',
      existingEmis: '',
    });
    setLoanEligibility({
      loanAmount: '',
      tenure: '60',
      income: '',
      existingEmis: '',
    });
    setTokenData(null);
    setFormErrors({});
    setError('');
    setOtpSent(false);
    setOtp('');
    setOtpVerified(false);
  };

  const handleSendOtp = () => {
    if (!/^\d{10}$/.test(form.mobile)) {
      setFormErrors((prev) => ({
        ...prev,
        mobile: 'Enter valid 10-digit mobile before sending OTP',
      }));
      return;
    }
    setOtpSent(true);
    setOtp('');
    setOtpVerified(false);
    setToast(`OTP sent to ${form.mobile}`);
    setTimeout(() => setToast(''), 3000);
  };

  const handleOtpChange = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setOtp(digits);
    if (digits.length === 6) {
      setOtpVerified(true);
    } else {
      setOtpVerified(false);
    }
  };

  const updateForm = (field, value) => {
    let val = value;
    if (field === 'pan') val = value.toUpperCase();
    if (field === 'aadhaarLast4') val = value.replace(/\D/g, '').slice(0, 4);
    if (field === 'mobile') val = value.replace(/\D/g, '').slice(0, 10);
    setForm((prev) => ({ ...prev, [field]: val }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary px-4 py-6 sm:px-6 lg:px-8">
      <Toast message={toast} onClose={() => setToast('')} />

      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-3">
          <Link
            to="/"
            className="rounded-lg p-2 text-text-muted transition-default hover:bg-bg-card hover:text-white"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              SwiftDesk
            </h1>
            <p className="text-base text-text-muted">In-Branch Self-Service Kiosk</p>
          </div>
        </div>

        <StepIndicator currentStep={step} />

        {error && (
          <div className="mb-4 rounded-xl bg-danger/20 px-4 py-3 text-base text-danger">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {SERVICES.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => handleServiceSelect(service)}
                className="rounded-xl border border-white/10 bg-bg-card p-6 text-left shadow-blue-lg transition-default hover:scale-[1.02] hover:border-accent-blue/50 sm:p-8"
              >
                <span className="text-4xl">{service.emoji}</span>
                <h3 className="mt-4 text-xl font-bold text-text-primary">
                  {service.title}
                </h3>
                <span className="mt-2 inline-block rounded-full bg-accent-gold/20 px-3 py-1 text-sm font-semibold text-accent-gold">
                  {service.wait} wait
                </span>
              </button>
            ))}
          </div>
        )}

        {step === 2 && selectedService && (
          <form
            onSubmit={handleFormSubmit}
            className="rounded-xl border border-white/10 bg-bg-card p-6 shadow-blue-lg sm:p-8"
          >
            <h2 className="mb-6 text-xl font-bold text-text-primary">
              Fill Details — {selectedService.title}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-base text-text-muted">Full Name</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => updateForm('fullName', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-bg-secondary px-4 py-3 text-base text-white focus:border-accent-blue focus:outline-none"
                  placeholder="Enter full name"
                />
                {formErrors.fullName && (
                  <p className="mt-1 text-sm text-danger">{formErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-base text-text-muted">
                  Aadhaar Last 4 digits
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.aadhaarLast4}
                  onChange={(e) => updateForm('aadhaarLast4', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-bg-secondary px-4 py-3 text-base text-white focus:border-accent-blue focus:outline-none"
                  placeholder="1234"
                  maxLength={4}
                />
                {formErrors.aadhaarLast4 && (
                  <p className="mt-1 text-sm text-danger">{formErrors.aadhaarLast4}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-base text-text-muted">PAN Number</label>
                <input
                  type="text"
                  value={form.pan}
                  onChange={(e) => updateForm('pan', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-bg-secondary px-4 py-3 text-base uppercase text-white focus:border-accent-blue focus:outline-none"
                  placeholder="ABCDE1234F"
                  maxLength={10}
                />
                {formErrors.pan && (
                  <p className="mt-1 text-sm text-danger">{formErrors.pan}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-base text-text-muted">Mobile Number</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={form.mobile}
                  onChange={(e) => updateForm('mobile', e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-bg-secondary px-4 py-3 text-base text-white focus:border-accent-blue focus:outline-none"
                  placeholder="9876543210"
                  maxLength={10}
                />
                {formErrors.mobile && (
                  <p className="mt-1 text-sm text-danger">{formErrors.mobile}</p>
                )}
              </div>

              {selectedService.id === 'loan' && (
                <>
                  <div>
                    <label className="mb-2 block text-base text-text-muted">
                      Monthly Income (₹)
                    </label>
                    <input
                      type="number"
                      value={form.monthlyIncome}
                      onChange={(e) => updateForm('monthlyIncome', e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-bg-secondary px-4 py-3 text-base text-white focus:border-accent-blue focus:outline-none"
                      placeholder="50000"
                      min="0"
                    />
                    {formErrors.monthlyIncome && (
                      <p className="mt-1 text-sm text-danger">
                        {formErrors.monthlyIncome}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block text-base text-text-muted">
                      Existing EMIs (₹)
                    </label>
                    <input
                      type="number"
                      value={form.existingEmis}
                      onChange={(e) => updateForm('existingEmis', e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-bg-secondary px-4 py-3 text-base text-white focus:border-accent-blue focus:outline-none"
                      placeholder="10000"
                      min="0"
                    />
                  </div>
                </>
              )}

              <div className="sm:col-span-2 rounded-xl border border-white/10 bg-bg-secondary p-4">
                <p className="mb-3 text-sm font-semibold text-text-primary">
                  Customer Identity Verification
                </p>
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="rounded-xl bg-accent-blue px-5 py-3 text-base font-semibold text-white transition-default hover:bg-blue-600"
                  >
                    Send OTP
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-2 block text-sm text-text-muted">
                        Enter 6-digit OTP
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={otp}
                        onChange={(e) => handleOtpChange(e.target.value)}
                        className="w-full max-w-xs rounded-xl border border-white/10 bg-bg-card px-4 py-3 text-base tracking-widest text-white focus:border-accent-blue focus:outline-none"
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>
                    {otpVerified && (
                      <span className="inline-flex items-center rounded-full bg-success/20 px-3 py-1.5 text-sm font-semibold text-success">
                        ✅ Identity Verified
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleDigiLocker}
              className="mt-4 rounded-xl border border-accent-blue/50 bg-accent-blue/10 px-4 py-3 text-base font-medium text-accent-blue transition-default hover:bg-accent-blue/20"
            >
              Auto-fill with DigiLocker
            </button>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-xl border border-white/20 px-6 py-3 text-base font-medium text-text-muted transition-default hover:bg-bg-secondary"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!otpVerified || loading}
                className="flex-1 rounded-xl bg-accent-blue px-6 py-3 text-base font-semibold text-white transition-default hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Generating Token...' : 'Continue'}
              </button>
            </div>
          </form>
        )}

        {step === 3 && selectedService?.id === 'loan' && (
          <div className="rounded-xl border border-white/10 bg-bg-card p-6 shadow-blue-lg sm:p-8">
            <h2 className="mb-6 text-xl font-bold text-text-primary">
              Loan Eligibility Check
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-base text-text-muted">
                  Monthly Income (₹)
                </label>
                <input
                  type="number"
                  value={loanEligibility.income}
                  onChange={(e) =>
                    setLoanEligibility((p) => ({ ...p, income: e.target.value }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-bg-secondary px-4 py-3 text-base text-white focus:border-accent-blue focus:outline-none"
                  min="0"
                />
              </div>
              <div>
                <label className="mb-2 block text-base text-text-muted">
                  Existing EMIs (₹)
                </label>
                <input
                  type="number"
                  value={loanEligibility.existingEmis}
                  onChange={(e) =>
                    setLoanEligibility((p) => ({ ...p, existingEmis: e.target.value }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-bg-secondary px-4 py-3 text-base text-white focus:border-accent-blue focus:outline-none"
                  min="0"
                />
              </div>
              <div>
                <label className="mb-2 block text-base text-text-muted">
                  Loan Amount Needed (₹)
                </label>
                <input
                  type="number"
                  value={loanEligibility.loanAmount}
                  onChange={(e) =>
                    setLoanEligibility((p) => ({ ...p, loanAmount: e.target.value }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-bg-secondary px-4 py-3 text-base text-white focus:border-accent-blue focus:outline-none"
                  min="0"
                />
              </div>
              <div>
                <label className="mb-2 block text-base text-text-muted">
                  Tenure (months)
                </label>
                <input
                  type="number"
                  value={loanEligibility.tenure}
                  onChange={(e) =>
                    setLoanEligibility((p) => ({ ...p, tenure: e.target.value }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-bg-secondary px-4 py-3 text-base text-white focus:border-accent-blue focus:outline-none"
                  min="12"
                  max="360"
                />
              </div>
            </div>

            {eligibilityResult && (
              <div
                className={`mt-6 rounded-xl p-4 text-base font-medium ${
                  eligibilityResult.eligible
                    ? 'bg-success/20 text-success'
                    : 'bg-danger/20 text-danger'
                }`}
              >
                {eligibilityResult.eligible ? 'ELIGIBLE ✅ — ' : 'NOT ELIGIBLE ❌ — '}
                {eligibilityResult.message}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-xl border border-white/20 px-6 py-3 text-base font-medium text-text-muted transition-default hover:bg-bg-secondary"
              >
                Back
              </button>
              <button
                type="button"
                onClick={generateToken}
                disabled={loading || (eligibilityResult && !eligibilityResult.eligible)}
                className="flex-1 rounded-xl bg-accent-blue px-6 py-3 text-base font-semibold text-white transition-default hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Token'}
              </button>
            </div>
          </div>
        )}

        {step === 4 && tokenData && (
          <div className="rounded-xl border-2 border-accent-gold/50 bg-bg-card p-8 text-center shadow-blue-lg sm:p-12">
            <p className="mb-2 text-base text-text-muted">Your Token</p>
            <p className="mb-8 text-5xl font-extrabold text-accent-gold sm:text-6xl">
              {tokenData.token}
            </p>

            <div className="mx-auto mb-8 grid max-w-md gap-4 text-left text-base sm:text-lg">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-text-muted">Service</span>
                <span className="font-semibold">{selectedService?.title}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-text-muted">Counter</span>
                <span className="font-semibold">{tokenData.counter}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-text-muted">Estimated Wait</span>
                <span className="font-semibold">{tokenData.wait_minutes} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Queue Position</span>
                <span className="font-semibold">
                  {tokenData.queue_position} people ahead
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={handleSmsToken}
                className="rounded-xl bg-accent-blue px-8 py-3 text-base font-semibold text-white transition-default hover:bg-blue-600"
              >
                SMS Token
              </button>
              <button
                type="button"
                onClick={startOver}
                className="rounded-xl border border-white/20 px-8 py-3 text-base font-semibold text-text-primary transition-default hover:bg-bg-secondary"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SwiftDesk;
