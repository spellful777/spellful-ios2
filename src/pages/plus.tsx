/**
 * /plus — Spellful Plus
 * Premium redesign: deep midnight purple, antique gold, lavender.
 * Sections: Hero → Features → Free vs Plus → Pricing → FAQ → Closing invitation.
 */
import { useState, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronDown, ChevronUp, Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/auth/auth-client';
import { plus } from 'virtual:content';
import { ContentListContext } from '@airo/content';
import { Capacitor } from '@capacitor/core';
import { fetchPlusProduct, purchasePlus, restorePurchases } from '@/lib/storekit';

// ── Types ──────────────────────────────────────────────────────────────────────

interface EntitlementState {
  isPlus: boolean;
  status: string | null;
  expiresAt: string | null;
}

// ── Celestial divider ──────────────────────────────────────────────────────────

function CelestialDivider() {
  return (
    <div className="flex items-center justify-center gap-3 my-2" aria-hidden="true">
      <div className="h-px flex-1 max-w-16" style={{ background: 'hsl(var(--primary) / 0.25)' }} />
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1l1.2 3.6L13 5.5l-2.8 2.7.7 3.8L8 10.2 5.1 12l.7-3.8L3 5.5l3.8-.9L8 1z"
          fill="hsl(var(--primary))" opacity="0.7" />
      </svg>
      <div className="h-px flex-1 max-w-16" style={{ background: 'hsl(var(--primary) / 0.25)' }} />
    </div>
  );
}

// ── Supporter badge icon ───────────────────────────────────────────────────────

function SupporterBadgeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5S12.83 18 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c.83 0 1.5-.67 1.5-1.5S12.83 3 12 3z"
        fill="hsl(var(--primary))" opacity="0.9" />
      <path d="M18 2l.75 2.25L21 5l-2.25.75L18 8l-.75-2.25L15 5l2.25-.75L18 2z"
        fill="hsl(var(--primary))" />
      <path d="M21 10l.4 1.2 1.2.4-1.2.4L21 13l-.4-1.2-1.2-.4 1.2-.4L21 10z"
        fill="hsl(var(--accent))" />
    </svg>
  );
}

// ── Feature tab data ───────────────────────────────────────────────────────────

const FEATURE_TABS = [
  {
    id: 'practice',
    icon: '✦',
    label: 'Practice Studio',
    headline: 'Your practice, your way.',
    body: 'A customizable personal practice home with rearrangeable widgets — your tarot, moon phase, journal, and routines arranged exactly how you want them.',
    detail: 'Drag and drop widgets to build a dashboard that reflects your unique path. Morning ritual? Evening reflection? Your Studio adapts.',
  },
  {
    id: 'themes',
    icon: '🎨',
    label: 'Celestial Themes',
    headline: 'A sanctuary that feels like yours.',
    body: 'Additional celestial color palettes and alternate dashboard layouts to make Spellful feel uniquely yours.',
    detail: 'Choose from deep midnight, twilight lavender, forest dusk, and more — each crafted to honor the aesthetic of your practice.',
  },
  {
    id: 'routines',
    icon: '📅',
    label: 'Routine Builder Pro',
    headline: 'Unlimited rituals, beautifully organized.',
    body: 'Unlimited custom practice routines, flexible reminder schedules, and saved templates. Free accounts include one routine.',
    detail: 'Build morning rituals, moon cycle practices, seasonal sabbat preparations, and more — with reminders that honor your schedule.',
  },
  {
    id: 'badge',
    icon: '✦',
    label: 'Supporter Badge',
    headline: 'Wear your support with grace.',
    body: 'An optional, tasteful celestial emblem you can choose to display on your profile and posts.',
    detail: 'Showing your support for free spiritual education — always opt-in, never required, never intrusive.',
  },
] as const;

// ── Purchase CTA block ─────────────────────────────────────────────────────────

function PurchaseCta({
  isSubscribed, isNative, purchasing, restoring, purchaseError,
  displayPrice, onPurchase, onRestore,
}: {
  isSubscribed: boolean;
  isNative: boolean;
  purchasing: boolean;
  restoring: boolean;
  purchaseError: string | null;
  displayPrice: string;
  onPurchase: () => void;
  onRestore: () => void;
}) {
  if (isSubscribed) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full border"
          style={{ borderColor: 'hsl(var(--primary) / 0.4)', background: 'hsl(var(--primary) / 0.08)' }}>
          <SupporterBadgeIcon size={16} />
          <span className="text-sm font-medium" style={{ color: 'hsl(var(--primary))' }}>
            You're a Plus member
          </span>
        </div>
        <Link to="/account">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Manage subscription
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {isNative ? (
        <Button
          onClick={onPurchase}
          disabled={purchasing}
          className="px-10 py-3 text-base font-semibold rounded-full"
          style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
          aria-label="Subscribe to Spellful Plus"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {purchasing ? 'Processing…' : plus.pricing.primaryCta}
        </Button>
      ) : (
        <div className="flex flex-col items-center gap-1.5">
          <Button
            disabled
            className="px-10 py-3 text-base font-semibold rounded-full opacity-60 cursor-not-allowed"
            style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
            aria-label="Spellful Plus available in the iOS app"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {plus.pricing.primaryCta}
          </Button>
          <span className="text-xs text-muted-foreground">Available in the iOS app</span>
        </div>
      )}

      {purchaseError && (
        <p className="text-xs text-destructive text-center max-w-xs">{purchaseError}</p>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-3 mt-1">
        <Link to="/">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-sm">
            {plus.pricing.secondaryCta}
          </Button>
        </Link>
        {isNative && (
          <Button variant="ghost" size="sm" onClick={onRestore} disabled={restoring}
            className="text-muted-foreground hover:text-foreground text-sm">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            {restoring ? 'Restoring…' : 'Restore Purchases'}
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-1">{plus.pricing.billingNote}</p>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function PlusPage() {
  const { session } = useSession();
  const [entitlement, setEntitlement] = useState<EntitlementState | null>(null);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [displayPrice, setDisplayPrice] = useState<string>(plus.pricing.price);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [activeFeature, setActiveFeature] = useState<string>('practice');
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!session?.user) return;
    fetch('/api/plus/entitlement', { credentials: 'include' })
      .then((r) => r.json() as Promise<EntitlementState>)
      .then(setEntitlement)
      .catch(() => undefined);
  }, [session?.user]);

  useEffect(() => {
    if (!isNative) return;
    fetchPlusProduct().then((product) => {
      if (product?.displayPrice) setDisplayPrice(product.displayPrice);
    });
  }, [isNative]);

  const isSubscribed = entitlement?.isPlus === true;

  async function handlePurchase() {
    if (!session?.user?.id) return;
    setPurchasing(true);
    setPurchaseError(null);
    try {
      const result = await purchasePlus(session.user.id);
      if (result.ok && result.isPlus) {
        setEntitlement({ isPlus: true, status: result.status, expiresAt: result.expiresAt });
      } else if (result.error && result.error !== 'USER_CANCELLED') {
        setPurchaseError('Purchase could not be completed. Please try again.');
      }
    } finally {
      setPurchasing(false);
    }
  }

  async function handleRestore() {
    setRestoring(true);
    setPurchaseError(null);
    try {
      const result = await restorePurchases();
      if (result.ok && result.isPlus) {
        setEntitlement({ isPlus: true, status: result.status, expiresAt: result.expiresAt });
      } else if (result.error && result.error !== 'NO_TRANSACTIONS') {
        setPurchaseError('Could not restore purchases. Please try again.');
      }
    } finally {
      setRestoring(false);
    }
  }

  const activeTab = FEATURE_TABS.find((t) => t.id === activeFeature) ?? FEATURE_TABS[0];

  return (
    <>
      <Helmet>
        <title>{plus.meta.title}</title>
        <meta name="description" content={plus.meta.description} />
        <meta property="og:title" content={plus.meta.title} />
        <meta property="og:description" content={plus.meta.description} />
        <meta property="og:type" content="website" />
      </Helmet>

      <main className="min-h-screen" style={{ background: 'hsl(var(--background))' }}>

        {/* ── Section 1: Premium Hero ── */}
        <section className="relative py-24 px-4 text-center overflow-hidden">
          {/* Radial cosmic glow */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
            style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, hsl(var(--cosmic-bg-center) / 0.55) 0%, transparent 70%)' }} />
          {/* Subtle star field */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
            style={{ backgroundImage: 'radial-gradient(1px 1px at 20% 30%, hsl(var(--primary) / 0.4) 0%, transparent 100%), radial-gradient(1px 1px at 80% 20%, hsl(var(--accent) / 0.3) 0%, transparent 100%), radial-gradient(1px 1px at 60% 70%, hsl(var(--primary) / 0.25) 0%, transparent 100%)' }} />

          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' as const }}
            className="relative max-w-2xl mx-auto"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
              style={{ background: 'hsl(var(--primary) / 0.1)', border: '1px solid hsl(var(--primary) / 0.3)' }}>
              <SupporterBadgeIcon size={14} />
              <span className="text-xs font-medium tracking-wide" style={{ color: 'hsl(var(--primary))' }}>
                {plus.pricing.name}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight"
              style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--foreground))' }}>
              Make Your Magic<br />
              <span style={{ color: 'hsl(var(--primary))' }}>Your Own.</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
              Create a sanctuary that reflects your unique path with celestial themes, personalized rituals, and magical tools designed around your practice.
            </p>

            <PurchaseCta
              isSubscribed={isSubscribed}
              isNative={isNative}
              purchasing={purchasing}
              restoring={restoring}
              purchaseError={purchaseError}
              displayPrice={displayPrice}
              onPurchase={handlePurchase}
              onRestore={handleRestore}
            />
          </motion.div>
        </section>

        {/* ── Section 2: Discover Your Plus Features ── */}
        <section className="py-20 px-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, ease: 'easeOut' as const }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3"
              style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--foreground))' }}>
              Discover Your Plus Features
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Every feature is designed to deepen your practice — not gate it.
            </p>
          </motion.div>

          {/* Feature tab selector */}
          <div className="flex flex-wrap justify-center gap-2 mb-8" role="tablist" aria-label="Plus features">
            {FEATURE_TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeFeature === tab.id}
                aria-controls={`feature-panel-${tab.id}`}
                onClick={() => setActiveFeature(tab.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  background: activeFeature === tab.id ? 'hsl(var(--primary))' : 'hsl(var(--card))',
                  color: activeFeature === tab.id ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                  border: `1px solid ${activeFeature === tab.id ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
                }}
              >
                <span aria-hidden="true">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Feature panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature}
              id={`feature-panel-${activeFeature}`}
              role="tabpanel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' as const }}
              className="rounded-2xl p-8 text-center"
              style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--primary) / 0.2)' }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl"
                style={{ background: 'hsl(var(--primary) / 0.12)', border: '1px solid hsl(var(--primary) / 0.2)' }}>
                {activeTab.icon}
              </div>
              <h3 className="text-xl font-bold mb-3"
                style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--foreground))' }}>
                {activeTab.headline}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-md mx-auto">
                {activeTab.body}
              </p>
              <p className="text-xs leading-relaxed max-w-sm mx-auto"
                style={{ color: 'hsl(var(--accent))' }}>
                {activeTab.detail}
              </p>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* ── Section 3: Free vs Plus ── */}
        <section className="py-20 px-4 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, ease: 'easeOut' as const }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3"
              style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--foreground))' }}>
              Free vs Plus
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              The knowledge, community, and core tools stay free for everyone — always.
            </p>
          </motion.div>

          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid hsl(var(--border))' }}>
            {/* Header row */}
            <div className="grid grid-cols-2">
              <div className="px-5 py-4 border-r" style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }}>
                <p className="text-sm font-semibold text-foreground">{plus.comparison.freeLabel}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Always free</p>
              </div>
              <div className="px-5 py-4" style={{ background: 'hsl(var(--primary) / 0.08)' }}>
                <p className="text-sm font-semibold" style={{ color: 'hsl(var(--primary))' }}>
                  {plus.comparison.plusLabel}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{displayPrice}/month</p>
              </div>
            </div>

            {/* Items */}
            <div className="grid grid-cols-2 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
              <div className="px-5 py-5 border-r space-y-2.5"
                style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }}>
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
              <div className="px-5 py-5 space-y-2.5"
                style={{ background: 'hsl(var(--primary) / 0.04)' }}>
                <ContentListContext field="plus.comparison.plusItems">
                  {plus.comparison.plusItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 flex-shrink-0 text-xs" style={{ color: 'hsl(var(--primary))' }}>✦</span>
                      <span className="text-xs text-foreground leading-snug">{item}</span>
                    </div>
                  ))}
                </ContentListContext>
              </div>
            </div>
          </div>

          {/* Why free note */}
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 px-6 py-5 rounded-2xl text-center"
            style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
          >
            <p className="text-xs font-semibold mb-2" style={{ color: 'hsl(var(--primary))' }}>
              {plus.whyFree.heading}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">{plus.whyFree.body}</p>
          </motion.div>
        </section>

        {/* ── Section 4: Pricing ── */}
        <section className="py-20 px-4 max-w-sm mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, ease: 'easeOut' as const }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-8"
              style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--foreground))' }}>
              Simple Membership
            </h2>

            <div className="rounded-3xl p-8"
              style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--primary) / 0.3)' }}>
              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <span className="text-4xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--primary))' }}>
                    {displayPrice}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{plus.pricing.billingNote}</p>
              </div>

              <CelestialDivider />

              {/* Included list */}
              <ul className="space-y-2.5 text-left my-6">
                {FEATURE_TABS.map((f) => (
                  <li key={f.id} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'hsl(var(--primary) / 0.15)' }}>
                      <Check className="w-3 h-3" style={{ color: 'hsl(var(--primary))' }} />
                    </div>
                    <span className="text-sm text-foreground">{f.label}</span>
                  </li>
                ))}
              </ul>

              <CelestialDivider />

              <div className="mt-6">
                <PurchaseCta
                  isSubscribed={isSubscribed}
                  isNative={isNative}
                  purchasing={purchasing}
                  restoring={restoring}
                  purchaseError={purchaseError}
                  displayPrice={displayPrice}
                  onPurchase={handlePurchase}
                  onRestore={handleRestore}
                />
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── Section 5: FAQ ── */}
        <section className="py-20 px-4 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, ease: 'easeOut' as const }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold"
              style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--foreground))' }}>
              Questions
            </h2>
          </motion.div>

          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
            <ContentListContext field="plus.faq">
              {plus.faq.map((item) => (
                <div key={item.id} className="border-b last:border-0"
                  style={{ borderColor: 'hsl(var(--border))' }}>
                  <button
                    onClick={() => setOpenFaqId((prev) => (prev === item.id ? null : item.id))}
                    className="w-full flex items-center justify-between px-6 py-4 text-left gap-4 transition-colors hover:bg-black/5"
                    aria-expanded={openFaqId === item.id}
                  >
                    <span className="text-sm font-medium text-foreground">{item.question}</span>
                    <span className="flex-shrink-0 text-muted-foreground">
                      {openFaqId === item.id
                        ? <ChevronUp className="w-4 h-4" />
                        : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaqId === item.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' as const }}
                        style={{ overflow: 'hidden' }}
                      >
                        <p className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </ContentListContext>
          </div>
        </section>

        {/* ── Section 6: Closing invitation ── */}
        <section className="py-20 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
            style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 100%, hsl(var(--cosmic-bg-center) / 0.4) 0%, transparent 70%)' }} />
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, ease: 'easeOut' as const }}
            className="relative max-w-xl mx-auto"
          >
            <div className="text-3xl mb-4" aria-hidden="true">✦</div>
            <h2 className="text-2xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--foreground))' }}>
              Personalize your sanctuary.
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-8 leading-relaxed max-w-md mx-auto">
              Your practice is yours. Plus simply gives you more ways to make it feel that way.
            </p>
            <PurchaseCta
              isSubscribed={isSubscribed}
              isNative={isNative}
              purchasing={purchasing}
              restoring={restoring}
              purchaseError={purchaseError}
              displayPrice={displayPrice}
              onPurchase={handlePurchase}
              onRestore={handleRestore}
            />
          </motion.div>
        </section>

        {/* ── Footer links ── */}
        <div className="py-8 px-4 text-center border-t" style={{ borderColor: 'hsl(var(--border))' }}>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <span aria-hidden="true">·</span>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Use</Link>
            <span aria-hidden="true">·</span>
            <Link to="/account" className="hover:text-foreground transition-colors">Manage Subscription</Link>
            {isNative && (
              <>
                <span aria-hidden="true">·</span>
                <button onClick={handleRestore} disabled={restoring}
                  className="hover:text-foreground transition-colors disabled:opacity-50">
                  {restoring ? 'Restoring…' : 'Restore Purchases'}
                </button>
              </>
            )}
          </div>
        </div>

      </main>
    </>
  );
}
