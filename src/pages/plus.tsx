/**
 * /plus — Explore Spellful Plus
 * Public page. Shows benefits, comparison table, FAQ, and a coming-soon
 * purchase CTA (StoreKit 2 integration required before enabling live purchase).
 */
import { useState, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Check, ChevronDown, ChevronUp, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/auth/auth-client';
import { plus } from 'virtual:content';
import { ContentListContext } from '@airo/content';

// ── Types ──────────────────────────────────────────────────────────────────────

interface EntitlementState {
  isPlus: boolean;
  status: string | null;
  expiresAt: string | null;
}

// ── Supporter Badge SVG ────────────────────────────────────────────────────────

function SupporterBadgeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <path
        d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5S12.83 18 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c.83 0 1.5-.67 1.5-1.5S12.83 3 12 3z"
        fill="hsl(var(--primary))"
        opacity="0.9"
      />
      <path
        d="M18 2l.75 2.25L21 5l-2.25.75L18 8l-.75-2.25L15 5l2.25-.75L18 2z"
        fill="hsl(var(--primary))"
      />
      <path
        d="M21 10l.4 1.2 1.2.4-1.2.4L21 13l-.4-1.2-1.2-.4 1.2-.4L21 10z"
        fill="hsl(var(--accent))"
      />
    </svg>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function PlusPage() {
  const { session } = useSession();
  const [entitlement, setEntitlement] = useState<EntitlementState | null>(null);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) return;
    fetch('/api/plus/entitlement', { credentials: 'include' })
      .then((r) => r.json() as Promise<EntitlementState>)
      .then(setEntitlement)
      .catch(() => undefined);
  }, [session?.user]);

  const isSubscribed = entitlement?.isPlus === true;

  return (
    <>
      <Helmet>
        <title>{plus.meta.title}</title>
        <meta name="description" content={plus.meta.description} />
        <meta property="og:title" content={plus.meta.title} />
        <meta property="og:description" content={plus.meta.description} />
        <meta property="og:type" content="website" />
      </Helmet>

      <main className="min-h-screen">
        {/* ── Hero ── */}
        <section className="relative py-20 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, hsl(var(--cosmic-bg-center) / 0.4) 0%, transparent 70%)' }} />

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' as const }}
            className="relative max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <SupporterBadgeIcon size={24} />
              <span className="text-sm font-medium tracking-wide"
                style={{ color: 'hsl(var(--primary))' }}>
                {plus.pricing.name}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight"
              style={{ fontFamily: 'var(--font-heading)' }}>
              {plus.hero.headline}
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
              {plus.hero.subheading}
            </p>

            {/* Price block */}
            <div className="inline-flex flex-col items-center gap-1 mb-8 px-6 py-4 rounded-2xl border border-primary/30"
              style={{ background: 'hsl(var(--card))' }}>
              <span className="text-3xl font-bold text-foreground"
                style={{ fontFamily: 'var(--font-heading)' }}>
                {plus.pricing.price}
              </span>
              <span className="text-xs text-muted-foreground">{plus.pricing.billingNote}</span>
            </div>

            {/* CTAs */}
            {isSubscribed ? (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/40"
                  style={{ background: 'hsl(var(--primary) / 0.1)' }}>
                  <SupporterBadgeIcon size={16} />
                  <span className="text-sm font-medium" style={{ color: 'hsl(var(--primary))' }}>
                    You're a Plus member
                  </span>
                </div>
                <Link to="/account">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    Manage subscription
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <Button
                    disabled
                    className="px-8 py-3 text-base font-semibold opacity-60 cursor-not-allowed"
                    style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
                    aria-label="Spellful Plus subscription coming soon to the iOS app"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {plus.pricing.primaryCta}
                  </Button>
                  <span className="text-xs text-muted-foreground">Available in the iOS app — coming soon</span>
                </div>
                <Link to="/">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                    {plus.pricing.secondaryCta}
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </section>

        {/* ── Benefits ── */}
        <section className="py-16 px-4 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10"
            style={{ fontFamily: 'var(--font-heading)' }}>
            What's included
          </h2>
          <ContentListContext field="plus.benefits">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plus.benefits.map((benefit) => (
                <motion.div
                  key={benefit.id}
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.4, ease: 'easeOut' as const }}
                  className="p-5 rounded-2xl border border-border"
                  style={{ background: 'hsl(var(--card))' }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                      style={{ background: 'hsl(var(--primary) / 0.12)' }}>
                      {benefit.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-foreground">{benefit.title}</h3>
                        {benefit.status === 'live' && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full"
                            style={{ background: 'hsl(var(--success) / 0.15)', color: 'hsl(var(--success))' }}>
                            Live
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ContentListContext>
        </section>

        {/* ── Comparison table ── */}
        <section className="py-16 px-4 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8"
            style={{ fontFamily: 'var(--font-heading)' }}>
            Free vs Plus
          </h2>
          <div className="rounded-2xl border border-border overflow-hidden"
            style={{ background: 'hsl(var(--card))' }}>
            <div className="grid grid-cols-2 border-b border-border">
              <div className="p-4 border-r border-border">
                <p className="text-sm font-semibold text-foreground">{plus.comparison.freeLabel}</p>
                <p className="text-xs text-muted-foreground">Always free</p>
              </div>
              <div className="p-4" style={{ background: 'hsl(var(--primary) / 0.06)' }}>
                <p className="text-sm font-semibold" style={{ color: 'hsl(var(--primary))' }}>
                  {plus.comparison.plusLabel}
                </p>
                <p className="text-xs text-muted-foreground">{plus.pricing.price}</p>
              </div>
            </div>
            <div className="grid grid-cols-2">
              <div className="p-4 border-r border-border space-y-2">
                <ContentListContext field="plus.comparison.freeItems">
                  {plus.comparison.freeItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                        style={{ color: 'hsl(var(--success))' }} />
                      <span className="text-xs text-foreground leading-snug">{item}</span>
                    </div>
                  ))}
                </ContentListContext>
              </div>
              <div className="p-4 space-y-2" style={{ background: 'hsl(var(--primary) / 0.03)' }}>
                <ContentListContext field="plus.comparison.plusItems">
                  {plus.comparison.plusItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Star className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                        style={{ color: 'hsl(var(--primary))' }} />
                      <span className="text-xs text-foreground leading-snug">{item}</span>
                    </div>
                  ))}
                </ContentListContext>
              </div>
            </div>
          </div>
        </section>

        {/* ── Why free ── */}
        <section className="py-16 px-4 max-w-2xl mx-auto text-center">
          <div className="p-8 rounded-2xl border border-border"
            style={{ background: 'hsl(var(--card))' }}>
            <h2 className="text-xl font-bold text-foreground mb-4"
              style={{ fontFamily: 'var(--font-heading)' }}>
              {plus.whyFree.heading}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{plus.whyFree.body}</p>
          </div>
        </section>

        {/* ── FAQ — fully inlined, no content props passed to components ── */}
        <section className="py-16 px-4 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8"
            style={{ fontFamily: 'var(--font-heading)' }}>
            Questions
          </h2>
          <div className="rounded-2xl border border-border px-6"
            style={{ background: 'hsl(var(--card))' }}>
            <ContentListContext field="plus.faq">
              {plus.faq.map((item) => (
                <div key={item.id} className="border-b border-border last:border-0">
                  <button
                    onClick={() => setOpenFaqId((prev) => (prev === item.id ? null : item.id))}
                    className="w-full flex items-center justify-between py-4 text-left gap-4"
                    aria-expanded={openFaqId === item.id}
                  >
                    <span className="text-sm font-medium text-foreground">{item.question}</span>
                    {openFaqId === item.id
                      ? <ChevronUp className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                      : <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                    }
                  </button>
                  {openFaqId === item.id && (
                    <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                  )}
                </div>
              ))}
            </ContentListContext>
          </div>
        </section>

        {/* ── Footer links ── */}
        <section className="py-8 px-4 text-center border-t border-border">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Use</Link>
            <span>·</span>
            <Link to="/account" className="hover:text-foreground transition-colors">Manage Subscription</Link>
            <span>·</span>
            <span className="opacity-50">Restore Purchases (iOS app)</span>
          </div>
        </section>
      </main>
    </>
  );
}
