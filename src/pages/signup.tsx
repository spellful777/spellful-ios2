import { signup } from 'virtual:content';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { authClient, useSession } from '@/lib/auth/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Sparkles, Mail, CheckCircle } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const STAR_DATA = Array.from({ length: 40 }, (_, i) => {
  const a = (i * 1664525 + 1013904223) & 0xffffffff;
  const b = (a * 1664525 + 1013904223) & 0xffffffff;
  const c = (b * 1664525 + 1013904223) & 0xffffffff;
  return {
    x: ((a >>> 0) % 10000) / 100,
    y: ((b >>> 0) % 10000) / 100,
    size: 1 + ((c >>> 0) % 3),
    delay: ((a >>> 0) % 40) * 0.1,
    duration: 2 + ((b >>> 0) % 3),
    color: i % 3 === 0 ? 'hsl(var(--primary))' : i % 3 === 1 ? 'hsl(var(--accent))' : 'white',
  };
});

type Step = 'form' | 'verify';

export default function SignupPage() {
  const navigate = useNavigate();
  const { session, isPending } = useSession();
  const [step, setStep] = useState<Step>('form');

  // Redirect already-authenticated users away from signup
  useEffect(() => {
    if (!isPending && session) {
      navigate('/', { replace: true });
    }
  }, [session, isPending, navigate]);

  // Core auth fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP / state
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await authClient.signUp.email({ name, email, password });
      if (!result) {
        setError('Something went wrong. Please try again.');
        return;
      }
      if (result.error) {
        setError(result.error.message ?? 'Could not create account.');
      } else {
        setStep('verify');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function saveSignupMeta() {
    try {
      // Send automated welcome DM from Spellful Team (fire-and-forget)
      void fetch('/api/welcome-message', { method: 'POST', credentials: 'include' });
    } catch {
      // Non-critical — don't block navigation
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length < 6) { setError('Please enter the full 6-digit code.'); return; }
    setError('');
    setLoading(true);
    try {
      const result = await (authClient as unknown as { emailOtp?: { verifyEmail: (opts: { email: string; otp: string }) => Promise<{ error?: { message?: string } } | undefined> } }).emailOtp?.verifyEmail({ email, otp });
      if (!result) {
        setError('Something went wrong. Please try again.');
        return;
      }
      if (result.error) {
        setError(result.error.message ?? 'Invalid or expired code.');
      } else {
        await saveSignupMeta();
        navigate('/');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError('');
    try {
      await (authClient as unknown as { emailOtp?: { sendVerificationOtp: (opts: { email: string; type: string }) => Promise<void> } }).emailOtp?.sendVerificationOtp({ email, type: 'email-verification' });
    } catch {
      setError('Could not resend code. Please try again.');
    } finally {
      setResending(false);
    }
  }

  // Don't render while session is resolving
  if (isPending) return null;
  if (session) return null;

  return (
    <>
      <Helmet>
        <title>Create Account — Spellful</title>
        <meta name="description" content="Join Spellful to access your personal grimoire, tarot readings, moon rituals, and more." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background px-4 py-16">
        {/* Stars */}
        <div className="absolute inset-0 pointer-events-none">
          {STAR_DATA.map((star, i) => (
            <motion.div key={i} className="absolute rounded-full"
              style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size, background: star.color, boxShadow: `0 0 ${star.size * 2}px ${star.color}` }}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: star.duration, delay: star.delay, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative w-full max-w-md"
        >
          <div className="rounded-2xl border border-border bg-card p-8 shadow-2xl">
            {step === 'form' ? (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                    style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.1))' }}
                  >
                    <Sparkles className="w-8 h-8" style={{ color: 'hsl(var(--primary))' }} />
                  </motion.div>
                  <h1 className="font-serif text-3xl text-foreground mb-2">{signup.heading}</h1>
                  <p className="text-sm text-muted-foreground">{signup.subheading}</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-5">
                  {/* ── Core fields ── */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm text-muted-foreground">Name</Label>
                    <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="Your name" required autoComplete="name" className="bg-muted border-border" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com" required autoComplete="email" className="bg-muted border-border" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm text-muted-foreground">Password</Label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? 'text' : 'password'} value={password}
                        onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                        autoComplete="new-password" className="bg-muted border-border pr-10" minLength={8} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                  </div>

                  {error && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive text-center">{error}</motion.p>
                  )}

                  <Button type="submit" disabled={loading}
                    className="w-full font-medium bg-primary text-primary-foreground hover:bg-primary/90">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                        Creating account…
                      </span>
                    ) : signup.cta}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center text-xs"><span className="bg-card px-3 text-muted-foreground">✶</span></div>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  <span>{signup.signInPrompt}</span>{' '}
                  <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">{signup.signInLink}</Link>
                </p>
              </>
            ) : (
              <>
                {/* Verify step — unchanged */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                    style={{ background: 'hsl(var(--primary) / 0.15)' }}>
                    <Mail className="w-8 h-8" style={{ color: 'hsl(var(--primary))' }} />
                  </div>
                  <h1 className="font-serif text-3xl text-foreground mb-2">{signup.verifyHeading}</h1>
                  <p className="text-sm text-muted-foreground">
                    <span>{signup.verifySubheading}</span><br />
                    <span className="font-medium" style={{ color: 'hsl(var(--foreground))' }}>{email}</span>
                  </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  {error && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive text-center">{error}</motion.p>
                  )}

                  <Button type="submit" disabled={loading || otp.length < 6}
                    className="w-full font-medium bg-primary text-primary-foreground hover:bg-primary/90">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                        Verifying…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" />{signup.verifyButton}</span>
                    )}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-4">
                  <span>{signup.resendPrompt}</span>{' '}
                  <button onClick={handleResend} disabled={resending}
                    className="font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50">
                    {resending ? 'Sending…' : signup.resendLink}
                  </button>
                </p>
              </>
            )}
          </div>
        </motion.div>
      </main>
    </>
  );
}
