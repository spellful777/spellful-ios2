import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import { useSession } from '@/lib/auth/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Camera, Check, X, Eye, Plus, Trash2, ChevronDown, ChevronUp,
  Sparkles, Palette, BookOpen, Wand2, Settings2, ArrowLeft, ExternalLink,
  FileText, Clock, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { profile_studio as ps } from 'virtual:content';
import { InstallSection } from '@/components/InstallSpellful';

// ─── Accent swatches ──────────────────────────────────────────────────────────
const ACCENTS = [
  { key: 'gold',     label: 'Gold',     color: 'hsl(var(--primary))' },
  { key: 'lavender', label: 'Lavender', color: 'hsl(var(--accent))' },
  { key: 'rose',     label: 'Rose',     color: 'hsl(var(--footer-lavender))' },
  { key: 'sage',     label: 'Sage',     color: 'hsl(var(--secondary))' },
  { key: 'sky',      label: 'Sky',      color: 'hsl(var(--info))' },
  { key: 'ember',    label: 'Ember',    color: 'hsl(var(--warning))' },
  { key: 'violet',   label: 'Violet',   color: 'hsl(var(--footer-lavender))' },
  { key: 'moon',     label: 'Moon',     color: 'hsl(var(--muted-foreground))' },
];

// ─── Cover presets ────────────────────────────────────────────────────────────
const COVER_PRESETS = [
  { key: 'midnight', label: 'Midnight',  style: 'linear-gradient(135deg, hsl(var(--footer-bg-darkest)) 0%, hsl(var(--footer-bg-deep)) 50%, hsl(var(--muted)) 100%)' },
  { key: 'aurora',   label: 'Aurora',    style: 'linear-gradient(135deg, hsl(var(--footer-bg-deep)) 0%, hsl(var(--accent) / 0.4) 50%, hsl(var(--footer-lavender) / 0.3) 100%)' },
  { key: 'ember',    label: 'Ember',     style: 'linear-gradient(135deg, hsl(var(--card-deep)) 0%, hsl(var(--warning) / 0.25) 60%, hsl(var(--primary) / 0.2) 100%)' },
  { key: 'forest',   label: 'Forest',    style: 'linear-gradient(135deg, hsl(var(--footer-bg-darkest)) 0%, hsl(var(--secondary) / 0.2) 60%, hsl(var(--muted)) 100%)' },
  { key: 'cosmos',   label: 'Cosmos',    style: 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--footer-bg-deep)) 40%, hsl(var(--accent) / 0.3) 100%)' },
  { key: 'rose',     label: 'Rose Mist', style: 'linear-gradient(135deg, hsl(var(--card-deep)) 0%, hsl(var(--footer-lavender) / 0.35) 60%, hsl(var(--accent) / 0.2) 100%)' },
];

const WITCH_PATHS = ['Eclectic','Green','Hedge','Kitchen','Sea','Solitary','Ceremonial','Dianic','Faery','Chaos','Cosmic','Shadow'];
const ZODIAC_SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const INTEREST_SUGGESTIONS = ['Tarot','Moon Magic','Herbalism','Crystals','Astrology','Divination','Spellwork','Meditation','Dream Work','Shadow Work','Runes','Numerology','Candle Magic','Ritual','Wicca','Paganism'];

const PROFILE_THEMES = [
  { key: '', label: 'Spellful Default', desc: 'Classic dark mystical' },
  { key: 'celestial', label: 'Celestial Witch', desc: 'Deep violet starlight' },
  { key: 'forest', label: 'Forest Witch', desc: 'Earthy green shadows' },
  { key: 'lunar', label: 'Lunar Mystic', desc: 'Silver moonlit tones' },
  { key: 'gothic', label: 'Gothic Witch', desc: 'Dark monochrome drama' },
  { key: 'cottage', label: 'Cottage Witch', desc: 'Warm herbal greens' },
  { key: 'crystal', label: 'Crystal Mystic', desc: 'Golden crystal light' },
];

const AVATAR_FRAMES = [
  { key: '', label: 'None' },
  { key: 'moon', label: 'Moon' },
  { key: 'celestial', label: 'Celestial' },
  { key: 'botanical', label: 'Botanical' },
  { key: 'crystal', label: 'Crystal' },
  { key: 'ornate', label: 'Ornate' },
];

const PRACTICE_LABEL_OPTIONS = [
  'Green Witch','Kitchen Witch','Tarot Reader','Eclectic Practitioner',
  'Hedge Witch','Sea Witch','Cosmic Witch','Shadow Worker',
  'Crystal Healer','Herbalist','Astrologer','Diviner',
  'Rune Reader','Numerologist','Candle Witch','Faery Witch',
];

const DEFAULT_SECTIONS = [
  { id: 'about', label: 'About My Path' },
  { id: 'interests', label: 'Magical Interests' },
  { id: 'gallery', label: 'Sacred Space' },
  { id: 'featured', label: 'Featured Posts' },
  { id: 'coven', label: 'My Coven' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'soundscapes', label: 'Magical Soundscapes' },
  { id: 'guestbook', label: 'Guestbook' },
  { id: 'milestones', label: 'Milestones' },
];

type SectionConfig = { id: string; enabled: boolean; order: number };

type FormState = {
  name: string; bio: string; location: string; pronouns: string;
  witchPath: string; sunSign: string; moonSign: string; risingSign: string;
  profileVisibility: string; accentColor: string; coverPreset: string;
  coverImage: string | null;
  interestTags: string[];
  socialLinks: { instagram: string; tiktok: string; youtube: string; website: string };
  profileTheme: string;
  avatarFrame: string;
  practiceLabels: string[];
  profileStatus: string;
  profileSections: SectionConfig[];
  profileLayout: string;
  bioVisibility: string;
  locationVisibility: string;
  zodiacVisibility: string;
  socialLinksVisibility: string;
};

type IdentityField = { fieldKey: string; value: string; visibility: string };
type IdentityFormState = {
  magical_name: string; magical_path: string; experience_level: string;
  favorite_element: string; personal_motto: string; [key: string]: string;
};
type IdentityVisibility = {
  magical_name: string; magical_path: string; experience_level: string;
  favorite_element: string; personal_motto: string; [key: string]: string;
};

type Playlist = {
  id: number; provider: string; canonicalUrl: string; providerPlaylistId: string;
  customTitle: string; description: string; visibility: string;
  position: number; isFeatured: number; isCurrentVibe: number;
};

type GuestbookEntry = {
  id: number; text: string; moderationState: string; createdAt: string;
  authorUsername: string | null; authorImage: string | null;
};

type Milestone = {
  id: number; sourceType: string; title: string; milestoneDate: string;
  note: string; visibility: string; position: number;
};

type CollectionItem = {
  id: number; collectionId: number; name: string; note: string;
  emoji: string; visibility: string; position: number;
};

type Collection = {
  id: number; type: string; title: string; visibility: string;
  position: number; items: CollectionItem[];
};

const COLLECTION_TYPES: { type: string; label: string; emoji: string; placeholder: string }[] = [
  { type: 'crystals',     label: 'Favorite Crystals', emoji: '💎', placeholder: 'e.g. Amethyst, Rose Quartz…' },
  { type: 'herbs',        label: 'Herbal Cabinet',    emoji: '🌿', placeholder: 'e.g. Lavender, Mugwort…' },
  { type: 'tarot_decks',  label: 'Tarot Decks',       emoji: '🃏', placeholder: 'e.g. Rider-Waite, Thoth…' },
  { type: 'bookshelf',    label: 'Bookshelf',         emoji: '📚', placeholder: 'e.g. The Spiral Dance…' },
  { type: 'tools',        label: 'Magical Tools',     emoji: '🔮', placeholder: 'e.g. Athame, Wand…' },
  { type: 'inspirations', label: 'Inspirations',      emoji: '✨', placeholder: 'e.g. The Moon, Hecate…' },
];

const EXPERIENCE_LEVELS = ['Curious Beginner', 'Exploring', 'Experienced Practitioner', 'Prefer Not to Say'];
const ELEMENTS = ['Earth', 'Air', 'Fire', 'Water', 'Spirit', 'Other', 'None'];
const PROFILE_LAYOUTS = [
  { key: 'compact',   label: 'Compact',   desc: 'Condensed, single-column' },
  { key: 'classic',   label: 'Classic',   desc: 'Balanced two-column layout' },
  { key: 'immersive', label: 'Immersive', desc: 'Full-width hero with large cover' },
];

const DEFAULT_FORM_REAL: FormState = {
  name: '', bio: '', location: '', pronouns: '', witchPath: '',
  sunSign: '', moonSign: '', risingSign: '', profileVisibility: 'public',
  accentColor: 'gold', coverPreset: 'midnight', coverImage: null,
  interestTags: [],
  socialLinks: { instagram: '', tiktok: '', youtube: '', website: '' },
  profileTheme: '', avatarFrame: '', practiceLabels: [], profileStatus: '',
  profileSections: DEFAULT_SECTIONS.map((s, i) => ({ id: s.id, enabled: true, order: i })),
  profileLayout: 'classic',
  bioVisibility: 'public',
  locationVisibility: 'public',
  zodiacVisibility: 'public',
  socialLinksVisibility: 'public',
};

function accentCss(key: string): string {
  return ACCENTS.find(a => a.key === key)?.color ?? 'hsl(var(--primary))';
}

// ─── Small collapsible section wrapper ───────────────────────────────────────
function Collapsible({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid hsl(var(--border))' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-left transition-colors"
        style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
      >
        <span>{title}</span>
        {open ? <ChevronUp className="w-4 h-4 opacity-60" /> : <ChevronDown className="w-4 h-4 opacity-60" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="p-4 space-y-3" style={{ background: 'hsl(var(--card))' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Field row ────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{label}</Label>
      {children}
    </div>
  );
}

type StudioTab = 'look' | 'about' | 'magic' | 'more';

interface AppStatus { id: number; status: string; requestedAccountType: string; creatorName: string; reviewReason: string; submittedAt: string; updatedAt: string; }
type SessionUser = { username?: string; id: string; [key: string]: unknown };

const TABS: { id: StudioTab; label: string; icon: React.ElementType }[] = [
  { id: 'look',  label: 'Look',  icon: Palette },
  { id: 'about', label: 'About', icon: BookOpen },
  { id: 'magic', label: 'Magic', icon: Wand2 },
  { id: 'more',  label: 'More',  icon: Settings2 },
];

export default function ProfileStudioPage() {
  const navigate = useNavigate();
  const { session, isPending } = useSession();

  const [form, setForm] = useState<FormState>(DEFAULT_FORM_REAL);
  const [original, setOriginal] = useState<FormState>(DEFAULT_FORM_REAL);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<StudioTab>('look');
  const [previewMode, setPreviewMode] = useState<'me' | 'public' | 'coven'>('me');
  const [tagInput, setTagInput] = useState('');
  const [coverUploading, setCoverUploading] = useState(false);

  // Identity fields
  const [identityForm, setIdentityForm] = useState<IdentityFormState>({
    magical_name: '', magical_path: '', experience_level: '', favorite_element: '', personal_motto: '',
  });
  const [identityVis, setIdentityVis] = useState<IdentityVisibility>({
    magical_name: 'private', magical_path: 'private', experience_level: 'private',
    favorite_element: 'private', personal_motto: 'private',
  });
  const [identitySaving, setIdentitySaving] = useState<string | null>(null);
  const [identitySaved, setIdentitySaved] = useState<string | null>(null);

  // Collections
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemNote, setNewItemNote] = useState('');
  const [newItemEmoji, setNewItemEmoji] = useState('');
  const [addingItem, setAddingItem] = useState(false);

  // Privacy permissions
  const [messagePermission, setMessagePermission] = useState('everyone');
  const [invitePermission, setInvitePermission] = useState('everyone');

  // Creator application status
  const [appStatus, setAppStatus] = useState<AppStatus | null>(null);
  const [appStatusLoading, setAppStatusLoading] = useState(false);
  const [hideOnlineStatus, setHideOnlineStatus] = useState(false);

  // Soundscapes
  const [soundscapesEnabled, setSoundscapesEnabled] = useState(false);
  const [soundscapesVis, setSoundscapesVis] = useState('private');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistUrl, setNewPlaylistUrl] = useState('');
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [playlistError, setPlaylistError] = useState('');
  const [addingPlaylist, setAddingPlaylist] = useState(false);

  // Guestbook
  const [guestbookEnabled, setGuestbookEnabled] = useState(false);
  const [guestbookSubmitters, setGuestbookSubmitters] = useState('coven');
  const [guestbookVis, setGuestbookVis] = useState('coven');
  const [guestbookApproval, setGuestbookApproval] = useState(true);
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>([]);
  const [guestbookLoading, setGuestbookLoading] = useState(false);

  // Milestones
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [newMilestoneNote, setNewMilestoneNote] = useState('');
  const [newMilestoneVis, setNewMilestoneVis] = useState('private');
  const [addingMilestone, setAddingMilestone] = useState(false);

  const coverRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const isDirty = JSON.stringify(form) !== JSON.stringify(original);

  // ── Auth redirect ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPending && !session) navigate('/login?redirect=/account/profile');
  }, [session, isPending, navigate]);

  // ── Load identity ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!session?.user?.id) return;
    fetch('/api/profile/identity', { credentials: 'include' })
      .then(r => r.json())
      .then((data: { fields?: IdentityField[] }) => {
        if (!data.fields) return;
        const nf: IdentityFormState = { magical_name: '', magical_path: '', experience_level: '', favorite_element: '', personal_motto: '' };
        const nv: IdentityVisibility = { magical_name: 'private', magical_path: 'private', experience_level: 'private', favorite_element: 'private', personal_motto: 'private' };
        for (const f of data.fields) { nf[f.fieldKey] = f.value; nv[f.fieldKey] = f.visibility; }
        setIdentityForm(nf);
        setIdentityVis(nv);
      })
      .catch(() => {});
  }, [session?.user?.id]);

  // ── Load collections ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!session?.user?.id) return;
    setCollectionsLoading(true);
    fetch('/api/profile/collections', { credentials: 'include' })
      .then(r => r.json())
      .then((data: { collections?: Collection[] }) => { if (data.collections) setCollections(data.collections); })
      .catch(() => {})
      .finally(() => setCollectionsLoading(false));
  }, [session?.user?.id]);

  // ── Load soundscapes ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!session?.user?.id) return;
    fetch('/api/profile/soundscapes/settings', { credentials: 'include' })
      .then(r => r.json())
      .then((data: { settings?: { enabled: number; visibility: string }; playlists?: Playlist[] }) => {
        if (data.settings) { setSoundscapesEnabled(!!data.settings.enabled); setSoundscapesVis(data.settings.visibility ?? 'private'); }
        if (data.playlists) setPlaylists(data.playlists);
      })
      .catch(() => {});
  }, [session?.user?.id]);

  // ── Load guestbook ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!session?.user?.id) return;
    setGuestbookLoading(true);
    Promise.all([
      fetch('/api/profile/guestbook/settings', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/profile/guestbook/entries', { credentials: 'include' }).then(r => r.json()),
    ])
      .then(([sd, ed]: [
        { settings?: { enabled: number; allowedSubmitters: string; visibility: string; requireApproval: number } },
        { entries?: GuestbookEntry[] }
      ]) => {
        if (sd.settings) {
          setGuestbookEnabled(!!sd.settings.enabled);
          setGuestbookSubmitters(sd.settings.allowedSubmitters ?? 'coven');
          setGuestbookVis(sd.settings.visibility ?? 'coven');
          setGuestbookApproval(!!sd.settings.requireApproval);
        }
        if (ed.entries) setGuestbookEntries(ed.entries);
      })
      .catch(() => {})
      .finally(() => setGuestbookLoading(false));
  }, [session?.user?.id]);

  // ── Load milestones ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!session?.user?.id) return;
    fetch('/api/profile/milestones', { credentials: 'include' })
      .then(r => r.json())
      .then((data: { milestones?: Milestone[] }) => { if (data.milestones) setMilestones(data.milestones); })
      .catch(() => {});
  }, [session?.user?.id]);

  // ── Load profile ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!(session?.user as SessionUser | undefined)?.username) return;
    fetch(`/api/profile/${(session!.user as SessionUser).username}`, { credentials: 'include' })
      .then(r => r.json())
      .then((data: { profile?: Record<string, unknown> }) => {
        if (data.profile) {
          const p = data.profile;
          const rawSections = Array.isArray(p.profileSections) ? (p.profileSections as SectionConfig[]) : [];
          const mergedSections: SectionConfig[] = DEFAULT_SECTIONS.map((s, i) => {
            const saved = rawSections.find(c => c.id === s.id);
            return saved ?? { id: s.id, enabled: true, order: i };
          });
          const loaded: FormState = {
            name: String(p.name ?? ''),
            bio: String(p.bio ?? ''),
            location: String(p.location ?? ''),
            pronouns: String(p.pronouns ?? ''),
            witchPath: String(p.witchPath ?? ''),
            sunSign: String(p.sunSign ?? ''),
            moonSign: String(p.moonSign ?? ''),
            risingSign: String(p.risingSign ?? ''),
            profileVisibility: String(p.profileVisibility ?? 'public'),
            accentColor: String(p.accentColor ?? 'gold'),
            coverPreset: String(p.coverPreset ?? 'midnight'),
            coverImage: p.coverImage ? String(p.coverImage) : null,
            interestTags: Array.isArray(p.interestTags) ? (p.interestTags as string[]) : [],
            socialLinks: {
              instagram: String((p.socialLinks as Record<string, string>)?.instagram ?? ''),
              tiktok: String((p.socialLinks as Record<string, string>)?.tiktok ?? ''),
              youtube: String((p.socialLinks as Record<string, string>)?.youtube ?? ''),
              website: String((p.socialLinks as Record<string, string>)?.website ?? ''),
            },
            profileTheme: String(p.profileTheme ?? ''),
            avatarFrame: String(p.avatarFrame ?? ''),
            practiceLabels: Array.isArray(p.practiceLabels) ? (p.practiceLabels as string[]) : [],
            profileStatus: String(p.profileStatus ?? ''),
            profileSections: mergedSections,
            profileLayout: String(p.profileLayout ?? 'classic'),
            bioVisibility: String(p.bioVisibility ?? 'public'),
            locationVisibility: String(p.locationVisibility ?? 'public'),
            zodiacVisibility: String(p.zodiacVisibility ?? 'public'),
            socialLinksVisibility: String(p.socialLinksVisibility ?? 'public'),
          };
          setForm(loaded);
          setOriginal(loaded);
          setMessagePermission(String(p.messagePermission ?? 'everyone'));
          setInvitePermission(String(p.invitePermission ?? 'everyone'));
          setHideOnlineStatus(!!p.hideOnlineStatus);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [(session?.user as SessionUser | undefined)?.username]);

  // ── Privacy helpers ────────────────────────────────────────────────────────
  async function saveHideOnlineStatus(val: boolean) {
    setHideOnlineStatus(val);
    await fetch('/api/presence/settings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ hideOnlineStatus: val }),
    });
  }

  // ── Creator application status fetch ──────────────────────────────────────
  useEffect(() => {
    if (!session?.user?.id) return;
    setAppStatusLoading(true);
    fetch('/api/creator-applications', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then((data: { applications?: AppStatus[] } | null) => {
        if (data?.applications?.length) setAppStatus(data.applications[0]);
      })
      .catch(() => {})
      .finally(() => setAppStatusLoading(false));
  }, [session?.user?.id]);

  // ── Soundscapes helpers ────────────────────────────────────────────────────
  async function saveSoundscapesSettings(updates: { enabled?: boolean; visibility?: string }) {
    await fetch('/api/profile/soundscapes/settings', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ enabled: updates.enabled !== undefined ? (updates.enabled ? 1 : 0) : undefined, visibility: updates.visibility }),
    });
  }

  async function addPlaylist() {
    if (!newPlaylistUrl.trim()) return;
    setAddingPlaylist(true); setPlaylistError('');
    try {
      const res = await fetch('/api/profile/soundscapes/playlists', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ url: newPlaylistUrl.trim(), customTitle: newPlaylistTitle.trim(), visibility: 'private' }),
      });
      const data = await res.json() as { id?: number; provider?: string; canonicalUrl?: string; providerPlaylistId?: string; error?: string };
      if (!res.ok) { setPlaylistError(data.error ?? 'Invalid URL'); return; }
      setPlaylists(prev => [...prev, { id: data.id!, provider: data.provider!, canonicalUrl: data.canonicalUrl!, providerPlaylistId: data.providerPlaylistId!, customTitle: newPlaylistTitle.trim(), description: '', visibility: 'private', position: prev.length, isFeatured: 0, isCurrentVibe: 0 }]);
      setNewPlaylistUrl(''); setNewPlaylistTitle('');
    } finally { setAddingPlaylist(false); }
  }

  async function deletePlaylist(id: number) {
    await fetch(`/api/profile/soundscapes/playlists/${id}`, { method: 'DELETE', credentials: 'include' });
    setPlaylists(prev => prev.filter(p => p.id !== id));
  }

  async function setFeaturedPlaylist(id: number, flag: 'isFeatured' | 'isCurrentVibe') {
    await fetch(`/api/profile/soundscapes/playlists/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ [flag]: 1 }),
    });
    setPlaylists(prev => prev.map(p => ({ ...p, [flag]: p.id === id ? 1 : 0 })));
  }

  // ── Guestbook helpers ──────────────────────────────────────────────────────
  async function saveGuestbookSettings(updates: { enabled?: boolean; allowedSubmitters?: string; visibility?: string; requireApproval?: boolean }) {
    await fetch('/api/profile/guestbook/settings', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({
        ...(updates.enabled !== undefined ? { enabled: updates.enabled ? 1 : 0 } : {}),
        ...(updates.allowedSubmitters !== undefined ? { allowedSubmitters: updates.allowedSubmitters } : {}),
        ...(updates.visibility !== undefined ? { visibility: updates.visibility } : {}),
        ...(updates.requireApproval !== undefined ? { requireApproval: updates.requireApproval ? 1 : 0 } : {}),
      }),
    });
  }

  async function moderateEntry(id: number, state: string) {
    await fetch(`/api/profile/guestbook/entries/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ moderationState: state }),
    });
    setGuestbookEntries(prev => prev.map(e => e.id === id ? { ...e, moderationState: state } : e));
  }

  async function deleteEntry(id: number) {
    await fetch(`/api/profile/guestbook/entries/${id}`, { method: 'DELETE', credentials: 'include' });
    setGuestbookEntries(prev => prev.filter(e => e.id !== id));
  }

  // ── Milestones helpers ─────────────────────────────────────────────────────
  async function addMilestone() {
    if (!newMilestoneTitle.trim()) return;
    setAddingMilestone(true);
    try {
      const res = await fetch('/api/profile/milestones', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ title: newMilestoneTitle.trim(), milestoneDate: newMilestoneDate, note: newMilestoneNote, visibility: newMilestoneVis }),
      });
      const data = await res.json() as { id?: number };
      if (res.ok && data.id) {
        setMilestones(prev => [...prev, { id: data.id!, sourceType: 'manual', title: newMilestoneTitle.trim(), milestoneDate: newMilestoneDate, note: newMilestoneNote, visibility: newMilestoneVis, position: prev.length }]);
        setNewMilestoneTitle(''); setNewMilestoneDate(''); setNewMilestoneNote('');
      }
    } finally { setAddingMilestone(false); }
  }

  async function deleteMilestone(id: number) {
    await fetch(`/api/profile/milestones/${id}`, { method: 'DELETE', credentials: 'include' });
    setMilestones(prev => prev.filter(m => m.id !== id));
  }

  async function updateMilestoneVis(id: number, visibility: string) {
    await fetch(`/api/profile/milestones/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ visibility }),
    });
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, visibility } : m));
  }

  // ── Form helpers ───────────────────────────────────────────────────────────
  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm(f => ({ ...f, [key]: val }));
    setSaved(false);
  }

  function setSocial(key: keyof FormState['socialLinks'], val: string) {
    setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, [key]: val } }));
    setSaved(false);
  }

  function addTag(tag: string) {
    const clean = tag.trim();
    if (!clean || form.interestTags.includes(clean) || form.interestTags.length >= 10) return;
    set('interestTags', [...form.interestTags, clean]);
    setTagInput('');
  }

  function removeTag(tag: string) {
    set('interestTags', form.interestTags.filter(t => t !== tag));
  }

  // ── Identity helpers ───────────────────────────────────────────────────────
  async function saveIdentityField(fieldKey: string) {
    setIdentitySaving(fieldKey); setIdentitySaved(null);
    try {
      await fetch('/api/profile/identity', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ fieldKey, value: identityForm[fieldKey] ?? '', visibility: identityVis[fieldKey] ?? 'private' }),
      });
      setIdentitySaved(fieldKey);
      setTimeout(() => setIdentitySaved(null), 2000);
    } catch { /* silent */ }
    finally { setIdentitySaving(null); }
  }

  // ── Collection helpers ─────────────────────────────────────────────────────
  async function addCollectionItem(collectionId: number) {
    if (!newItemName.trim()) return;
    setAddingItem(true);
    try {
      const r = await fetch(`/api/profile/collections/${collectionId}/items`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ name: newItemName.trim(), note: newItemNote.trim(), emoji: newItemEmoji.trim() }),
      });
      const d = await r.json() as { ok?: boolean; id?: number };
      if (d.ok) {
        const newItem: CollectionItem = { id: d.id ?? Date.now(), collectionId, name: newItemName.trim(), note: newItemNote.trim(), emoji: newItemEmoji.trim(), visibility: 'public', position: 0 };
        setCollections(prev => prev.map(c => c.id === collectionId ? { ...c, items: [...c.items, newItem] } : c));
        setNewItemName(''); setNewItemNote(''); setNewItemEmoji('');
      }
    } catch { /* silent */ }
    finally { setAddingItem(false); }
  }

  async function deleteCollectionItem(collectionId: number, itemId: number) {
    await fetch(`/api/profile/collections/${collectionId}/items/${itemId}`, { method: 'DELETE', credentials: 'include' });
    setCollections(prev => prev.map(c => c.id === collectionId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c));
  }

  async function ensureCollection(type: string, label: string): Promise<Collection | null> {
    const existing = collections.find(c => c.type === type);
    if (existing) return existing;
    try {
      const r = await fetch('/api/profile/collections', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ type, title: label, visibility: 'private' }),
      });
      const d = await r.json() as { ok?: boolean; collection?: Collection };
      if (d.collection) {
        const newCol: Collection = { ...d.collection, items: [] };
        setCollections(prev => [...prev, newCol]);
        return newCol;
      }
    } catch { /* silent */ }
    return null;
  }

  // ── Upload helpers ─────────────────────────────────────────────────────────
  async function uploadCover(file: File) {
    setCoverUploading(true);
    try {
      const fd = new FormData();
      fd.append('cover', file);
      const r = await fetch('/api/profile/cover', { method: 'POST', body: fd, credentials: 'include' });
      const data = await r.json() as { url?: string; error?: string };
      if (data.url) { set('coverImage', data.url); set('coverPreset', ''); }
      else setError(data.error ?? 'Upload failed');
    } catch { setError('Upload failed'); }
    finally { setCoverUploading(false); }
  }

  async function uploadAvatar(file: File) {
    const fd = new FormData();
    fd.append('avatar', file);
    const r = await fetch('/api/account/avatar', { method: 'POST', body: fd, credentials: 'include' });
    if (r.ok) {
      const data = await r.json() as { url?: string };
      if (data.url) setAvatarPreview(data.url);
    }
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true); setError('');
    try {
      const r = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name, bio: form.bio, location: form.location, pronouns: form.pronouns,
          witchPath: form.witchPath, sunSign: form.sunSign, moonSign: form.moonSign, risingSign: form.risingSign,
          profileVisibility: form.profileVisibility, profileLayout: form.profileLayout,
          accentColor: form.accentColor, coverPreset: form.coverPreset, coverImage: form.coverImage,
          interestTags: form.interestTags, socialLinks: form.socialLinks,
          profileTheme: form.profileTheme, avatarFrame: form.avatarFrame,
          practiceLabels: form.practiceLabels, profileStatus: form.profileStatus,
          profileSections: form.profileSections,
          messagePermission,
          invitePermission,
          bioVisibility: form.bioVisibility,
          locationVisibility: form.locationVisibility,
          zodiacVisibility: form.zodiacVisibility,
          socialLinksVisibility: form.socialLinksVisibility,
        }),
      });
      const data = await r.json() as { ok?: boolean; error?: string };
      if (data.ok) { setSaved(true); setOriginal(form); }
      else setError(data.error ?? 'Save failed');
    } catch { setError('Save failed'); }
    finally { setSaving(false); }
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const accent = accentCss(form.accentColor);
  const coverBg = form.coverImage
    ? { backgroundImage: `url(${form.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: COVER_PRESETS.find(p => p.key === form.coverPreset)?.style ?? COVER_PRESETS[0].style };
  const displayName = form.name || session?.user?.name || 'Your Name';
  const initials = displayName.slice(0, 2).toUpperCase();
  const avatarSrc = avatarPreview ?? session?.user?.image ?? null;

  // ── Completion score (5 signals) ───────────────────────────────────────────
  const completionScore = [
    !!avatarSrc,
    !!form.name,
    !!form.profileTheme || !!form.accentColor,
    !!form.bio,
    form.interestTags.length > 0,
  ].filter(Boolean).length;

  if (isPending || loading) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </main>
  );

  return (
    <>
      <Helmet>
        <title>{ps.title} — Spellful</title>
        <meta name="description" content="Customize your Spellful member profile — cover, avatar, accent color, bio, interests, and social links." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-screen py-6 px-4">
        <div className="max-w-2xl mx-auto space-y-4">

          {/* ── Top bar ── */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => navigate('/account')}
              className="flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">My Account</span>
            </button>
            <h1 className="text-lg font-serif font-bold flex-1 text-center sm:text-left" style={{ color: 'hsl(var(--foreground))' }}>
              Profile Studio
            </h1>
            {/* Preview mode toggle */}
            <div className="flex items-center gap-1 p-0.5 rounded-full" style={{ background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))' }}>
              {(['me', 'coven', 'public'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPreviewMode(mode)}
                  className="text-xs px-2.5 py-1 rounded-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary capitalize"
                  style={{
                    background: previewMode === mode ? 'hsl(var(--primary))' : 'transparent',
                    color: previewMode === mode ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                    fontFamily: 'var(--font-sans)',
                  }}
                  aria-pressed={previewMode === mode}
                  title={mode === 'me' ? 'Your full view' : mode === 'coven' ? 'What Coven members see' : 'What the public sees'}
                >
                  {mode === 'me' ? 'Me' : mode === 'coven' ? 'Coven' : 'Public'}
                </button>
              ))}
            </div>
            <button
              onClick={() => window.open(`/u/${(session?.user as SessionUser | undefined)?.username ?? ''}`, '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}
              title="Open live profile"
              aria-label="Open live public profile"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ── Live preview card ── */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid hsl(var(--border))' }}>
            {/* Cover */}
            <div className="h-20 relative" style={coverBg}>
              {/* Avatar overlapping cover */}
              <div
                className="absolute -bottom-7 left-4 w-14 h-14 rounded-full overflow-hidden flex items-center justify-center"
                style={{
                  background: 'hsl(var(--muted))',
                  boxShadow: `0 0 0 3px hsl(var(--card)), 0 0 0 5px ${accent}40`,
                }}
              >
                {avatarSrc
                  ? <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
                  : <span className="text-lg font-serif" style={{ color: accent }}>{initials}</span>
                }
              </div>
            </div>
            {/* Profile info */}
            <div className="pt-9 pb-3 px-4" style={{ background: 'hsl(var(--card))' }}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-serif font-semibold text-sm" style={{ color: 'hsl(var(--foreground))' }}>{displayName}</p>
                  {form.pronouns && <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{form.pronouns}</p>}
                  {form.profileStatus && <p className="text-xs mt-0.5 italic" style={{ color: accent }}>{form.profileStatus}</p>}
                </div>
                <div className="flex flex-wrap gap-1 justify-end">
                  {form.practiceLabels.slice(0, 2).map(l => (
                    <span key={l} className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}>{l}</span>
                  ))}
                </div>
              </div>
              {form.bio && <p className="text-xs mt-2 line-clamp-2" style={{ color: 'hsl(var(--muted-foreground))' }}>{form.bio}</p>}
              {form.interestTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.interestTags.slice(0, 4).map(t => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}>{t}</span>
                  ))}
                  {form.interestTags.length > 4 && <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>+{form.interestTags.length - 4}</span>}
                </div>
              )}
            </div>
          </div>

          {/* ── Preview mode indicator ── */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
            style={{ background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))' }}
          >
            <Eye className="w-3.5 h-3.5 shrink-0" style={{ color: 'hsl(var(--primary))' }} />
            <span style={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'var(--font-sans)' }}>
              {previewMode === 'me' && 'Showing your full profile — all fields visible to you as the owner.'}
              {previewMode === 'coven' && 'Showing what Coven members see — fields set to Coven or Public visibility are shown.'}
              {previewMode === 'public' && 'Showing what the public sees — only fields set to Public visibility are shown. Private and Coven-only fields are hidden.'}
            </span>
          </div>

          {/* ── Completion bar (only if < 5/5) ── */}
          {completionScore < 5 && (
            <div className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))' }}>
              <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: accent }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium" style={{ color: 'hsl(var(--foreground))' }}>Profile completion</span>
                  <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{completionScore}/5</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(var(--border))' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(completionScore / 5) * 100}%`, background: accent }} />
                </div>
              </div>
            </div>
          )}

          {/* ── Tab nav ── */}
          <div className="grid grid-cols-4 gap-1 p-1 rounded-xl" style={{ background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))' }}>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex flex-col items-center gap-1 py-2.5 rounded-lg text-xs font-medium transition-all"
                style={activeTab === id
                  ? { background: 'hsl(var(--card))', color: accent, boxShadow: '0 1px 3px hsl(var(--background) / 0.5)' }
                  : { color: 'hsl(var(--muted-foreground))' }
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* ── Tab panels ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-3"
            >

              {/* ════════════════════════════════════════════════════════════
                  LOOK TAB
              ════════════════════════════════════════════════════════════ */}
              {activeTab === 'look' && (
                <>
                  {/* Avatar */}
                  <Collapsible title="Avatar" defaultOpen>
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center" style={{ background: 'hsl(var(--muted))', boxShadow: `0 0 0 2px ${accent}` }}>
                          {avatarSrc
                            ? <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
                            : <span className="text-xl font-serif" style={{ color: accent }}>{initials}</span>
                          }
                        </div>
                        <button
                          onClick={() => avatarRef.current?.click()}
                          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: accent, color: 'hsl(var(--primary-foreground))' }}
                          aria-label="Upload avatar"
                        >
                          <Camera className="w-3 h-3" />
                        </button>
                        <input ref={avatarRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) void uploadAvatar(f); }} />
                      </div>
                      <div className="text-xs space-y-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        <p>Upload a photo or use a preset.</p>
                        <p>JPG, PNG, WebP · max 5 MB</p>
                      </div>
                    </div>
                  </Collapsible>

                  {/* Cover */}
                  <Collapsible title="Cover" defaultOpen>
                    <div className="grid grid-cols-3 gap-2">
                      {COVER_PRESETS.map(p => (
                        <button
                          key={p.key}
                          onClick={() => { set('coverPreset', p.key); set('coverImage', null); }}
                          className="relative rounded-lg overflow-hidden transition-all"
                          style={{ height: '44px', background: p.style, outline: form.coverPreset === p.key && !form.coverImage ? `2px solid ${accent}` : '2px solid transparent', outlineOffset: '2px' }}
                          aria-label={p.label}
                          title={p.label}
                        >
                          {form.coverPreset === p.key && !form.coverImage && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-white drop-shadow" />
                            </div>
                          )}
                          <span className="absolute bottom-1 left-0 right-0 text-center text-white/80 text-[10px]">{p.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Button variant="outline" size="sm" onClick={() => coverRef.current?.click()} disabled={coverUploading} className="gap-1.5 text-xs">
                        <Camera className="w-3.5 h-3.5" />
                        {coverUploading ? 'Uploading…' : 'Upload photo'}
                      </Button>
                      {form.coverImage && (
                        <Button variant="ghost" size="sm" onClick={() => { set('coverImage', null); set('coverPreset', 'midnight'); }} className="gap-1.5 text-xs text-destructive">
                          <X className="w-3.5 h-3.5" /> Remove
                        </Button>
                      )}
                      <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) void uploadCover(f); }} />
                    </div>
                  </Collapsible>

                  {/* Theme */}
                  <Collapsible title="Theme">
                    <div className="grid grid-cols-1 gap-2">
                      {PROFILE_THEMES.map(t => (
                        <button
                          key={t.key}
                          onClick={() => set('profileTheme', t.key)}
                          className="flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all"
                          style={{
                            background: form.profileTheme === t.key ? `${accent}15` : 'hsl(var(--muted))',
                            border: `1px solid ${form.profileTheme === t.key ? accent : 'hsl(var(--border))'}`,
                          }}
                        >
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>{t.label}</p>
                            <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{t.desc}</p>
                          </div>
                          {form.profileTheme === t.key && <Check className="w-4 h-4 flex-shrink-0" style={{ color: accent }} />}
                        </button>
                      ))}
                    </div>
                  </Collapsible>

                  {/* Accent color */}
                  <Collapsible title="Accent Color">
                    <div className="flex flex-wrap gap-2">
                      {ACCENTS.map(a => (
                        <button
                          key={a.key}
                          onClick={() => set('accentColor', a.key)}
                          className="w-9 h-9 rounded-full transition-all flex items-center justify-center"
                          style={{ background: a.color, outline: form.accentColor === a.key ? `3px solid ${a.color}` : '3px solid transparent', outlineOffset: '2px' }}
                          aria-label={a.label}
                          title={a.label}
                        >
                          {form.accentColor === a.key && <Check className="w-4 h-4 text-white drop-shadow" />}
                        </button>
                      ))}
                    </div>
                  </Collapsible>

                  {/* Avatar frame */}
                  <Collapsible title="Avatar Frame">
                    <div className="grid grid-cols-3 gap-2">
                      {AVATAR_FRAMES.map(f => (
                        <button
                          key={f.key}
                          onClick={() => set('avatarFrame', f.key)}
                          className="py-2 px-3 rounded-lg text-xs text-center transition-all"
                          style={{
                            background: form.avatarFrame === f.key ? `${accent}15` : 'hsl(var(--muted))',
                            border: `1px solid ${form.avatarFrame === f.key ? accent : 'hsl(var(--border))'}`,
                            color: form.avatarFrame === f.key ? accent : 'hsl(var(--foreground))',
                          }}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </Collapsible>

                  {/* Layout */}
                  <Collapsible title="Profile Layout">
                    <div className="space-y-2">
                      {PROFILE_LAYOUTS.map(l => (
                        <button
                          key={l.key}
                          onClick={() => set('profileLayout', l.key)}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all"
                          style={{
                            background: form.profileLayout === l.key ? `${accent}15` : 'hsl(var(--muted))',
                            border: `1px solid ${form.profileLayout === l.key ? accent : 'hsl(var(--border))'}`,
                          }}
                        >
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>{l.label}</p>
                            <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{l.desc}</p>
                          </div>
                          {form.profileLayout === l.key && <Check className="w-4 h-4 flex-shrink-0" style={{ color: accent }} />}
                        </button>
                      ))}
                    </div>
                  </Collapsible>
                </>
              )}

              {/* ════════════════════════════════════════════════════════════
                  ABOUT TAB
              ════════════════════════════════════════════════════════════ */}
              {activeTab === 'about' && (
                <>
                  <Collapsible title="Display Name & Bio" defaultOpen>
                    <Field label="Display name">
                      <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name or craft name" className="text-sm" />
                    </Field>
                    <Field label="Pronouns">
                      <Input value={form.pronouns} onChange={e => set('pronouns', e.target.value)} placeholder="e.g. she/her" className="text-sm" />
                    </Field>
                    <Field label="Profile status">
                      <Input value={form.profileStatus} onChange={e => set('profileStatus', e.target.value)} placeholder="e.g. Under the new moon…" className="text-sm" />
                    </Field>
                    <Field label="Bio">
                      <Textarea value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Tell your story…" rows={3} className="text-sm resize-none" />
                    </Field>
                    <Field label="Location">
                      <Input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Pacific Northwest" className="text-sm" />
                    </Field>
                  </Collapsible>

                  <Collapsible title="Witch Path">
                    <Field label="Path">
                      <Select value={form.witchPath || 'none'} onValueChange={v => set('witchPath', v === 'none' ? '' : v)}>
                        <SelectTrigger><SelectValue placeholder="Select path" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {WITCH_PATHS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                  </Collapsible>

                  <Collapsible title="Interests" defaultOpen>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {form.interestTags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}>
                          {tag}
                          <button onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } }}
                        placeholder="Add interest…"
                        className="text-sm flex-1"
                      />
                      <Button size="sm" variant="outline" onClick={() => addTag(tagInput)} disabled={form.interestTags.length >= 10}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {INTEREST_SUGGESTIONS.filter(s => !form.interestTags.includes(s)).slice(0, 8).map(s => (
                        <button key={s} onClick={() => addTag(s)} className="text-xs px-2 py-0.5 rounded-full transition-colors" style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))', border: '1px solid hsl(var(--border))' }}>
                          + {s}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>{form.interestTags.length}/10</p>
                  </Collapsible>

                  <Collapsible title="Practice Labels">
                    <div className="flex flex-wrap gap-1.5">
                      {PRACTICE_LABEL_OPTIONS.map(l => {
                        const active = form.practiceLabels.includes(l);
                        return (
                          <button
                            key={l}
                            onClick={() => set('practiceLabels', active ? form.practiceLabels.filter(x => x !== l) : [...form.practiceLabels, l])}
                            className="text-xs px-2.5 py-1 rounded-full transition-all"
                            style={{
                              background: active ? `${accent}20` : 'hsl(var(--muted))',
                              color: active ? accent : 'hsl(var(--muted-foreground))',
                              border: `1px solid ${active ? accent : 'hsl(var(--border))'}`,
                            }}
                          >
                            {l}
                          </button>
                        );
                      })}
                    </div>
                  </Collapsible>

                  <Collapsible title="Social Links">
                    {[
                      { key: 'instagram' as const, label: 'Instagram', placeholder: '@username' },
                      { key: 'tiktok' as const, label: 'TikTok', placeholder: '@username' },
                      { key: 'youtube' as const, label: 'YouTube', placeholder: 'Channel URL' },
                      { key: 'website' as const, label: 'Website', placeholder: 'https://…' },
                    ].map(s => (
                      <Field key={s.key} label={s.label}>
                        <Input value={form.socialLinks[s.key]} onChange={e => setSocial(s.key, e.target.value)} placeholder={s.placeholder} className="text-sm" />
                      </Field>
                    ))}
                  </Collapsible>
                </>
              )}

              {/* ════════════════════════════════════════════════════════════
                  MAGIC TAB
              ════════════════════════════════════════════════════════════ */}
              {activeTab === 'magic' && (
                <>
                  <Collapsible title="Astrology" defaultOpen>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Sun sign', key: 'sunSign' as const },
                        { label: 'Moon sign', key: 'moonSign' as const },
                        { label: 'Rising sign', key: 'risingSign' as const },
                      ].map(s => (
                        <Field key={s.key} label={s.label}>
                          <Select value={form[s.key] || 'none'} onValueChange={v => set(s.key, v === 'none' ? '' : v)}>
                            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {ZODIAC_SIGNS.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </Field>
                      ))}
                    </div>
                  </Collapsible>

                  <Collapsible title="Magical Identity" defaultOpen>
                    {[
                      { key: 'magical_name', label: 'Magical name', placeholder: 'Your craft name…' },
                      { key: 'magical_path', label: 'Magical path', placeholder: 'Your tradition or path…' },
                      { key: 'personal_motto', label: 'Personal motto', placeholder: 'Your guiding words…' },
                    ].map(f => (
                      <div key={f.key} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{f.label}</Label>
                          <div className="flex items-center gap-2">
                            <Select value={identityVis[f.key]} onValueChange={v => setIdentityVis(prev => ({ ...prev, [f.key]: v }))}>
                              <SelectTrigger className="h-6 text-xs w-24"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="public">Public</SelectItem>
                                <SelectItem value="coven">Coven</SelectItem>
                                <SelectItem value="private">Private</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => void saveIdentityField(f.key)} disabled={identitySaving === f.key}>
                              {identitySaved === f.key ? <Check className="w-3 h-3" /> : 'Save'}
                            </Button>
                          </div>
                        </div>
                        <Input value={identityForm[f.key]} onChange={e => setIdentityForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} className="text-sm" />
                      </div>
                    ))}

                    {/* Experience level */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Experience level</Label>
                        <div className="flex items-center gap-2">
                          <Select value={identityVis.experience_level} onValueChange={v => setIdentityVis(prev => ({ ...prev, experience_level: v }))}>
                            <SelectTrigger className="h-6 text-xs w-24"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="coven">Coven</SelectItem>
                              <SelectItem value="private">Private</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => void saveIdentityField('experience_level')} disabled={identitySaving === 'experience_level'}>
                            {identitySaved === 'experience_level' ? <Check className="w-3 h-3" /> : 'Save'}
                          </Button>
                        </div>
                      </div>
                      <Select value={identityForm.experience_level || 'none'} onValueChange={v => setIdentityForm(prev => ({ ...prev, experience_level: v === 'none' ? '' : v }))}>
                        <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {EXPERIENCE_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Favorite element */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Favorite element</Label>
                        <div className="flex items-center gap-2">
                          <Select value={identityVis.favorite_element} onValueChange={v => setIdentityVis(prev => ({ ...prev, favorite_element: v }))}>
                            <SelectTrigger className="h-6 text-xs w-24"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="coven">Coven</SelectItem>
                              <SelectItem value="private">Private</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => void saveIdentityField('favorite_element')} disabled={identitySaving === 'favorite_element'}>
                            {identitySaved === 'favorite_element' ? <Check className="w-3 h-3" /> : 'Save'}
                          </Button>
                        </div>
                      </div>
                      <Select value={identityForm.favorite_element || 'none'} onValueChange={v => setIdentityForm(prev => ({ ...prev, favorite_element: v === 'none' ? '' : v }))}>
                        <SelectTrigger><SelectValue placeholder="Select element" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {ELEMENTS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </Collapsible>

                  <Collapsible title="Magical Favorites">
                    {collectionsLoading ? (
                      <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Loading…</p>
                    ) : (
                      <div className="space-y-3">
                        {COLLECTION_TYPES.map(ct => {
                          const col = collections.find(c => c.type === ct.type);
                          const isActive = activeCollection === ct.type;
                          return (
                            <div key={ct.type} className="rounded-lg overflow-hidden" style={{ border: '1px solid hsl(var(--border))' }}>
                              <button
                                onClick={() => setActiveCollection(isActive ? null : ct.type)}
                                className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-left"
                                style={{ background: 'hsl(var(--muted))' }}
                              >
                                <span style={{ color: 'hsl(var(--foreground))' }}>{ct.emoji} {ct.label}</span>
                                <span className="flex items-center gap-2">
                                  <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{col?.items.length ?? 0}</span>
                                  {isActive ? <ChevronUp className="w-3.5 h-3.5 opacity-60" /> : <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
                                </span>
                              </button>
                              {isActive && (
                                <div className="p-3 space-y-2" style={{ background: 'hsl(var(--card))' }}>
                                  {col?.items.map(item => (
                                    <div key={item.id} className="flex items-center justify-between gap-2 text-xs py-1">
                                      <span style={{ color: 'hsl(var(--foreground))' }}>{item.emoji} {item.name}</span>
                                      <button onClick={() => void deleteCollectionItem(col.id, item.id)} className="text-destructive opacity-60 hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                  ))}
                                  <div className="flex gap-1.5 pt-1">
                                    <Input value={newItemEmoji} onChange={e => setNewItemEmoji(e.target.value)} placeholder="✨" className="w-12 text-sm text-center" />
                                    <Input value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder={ct.placeholder} className="text-sm flex-1" />
                                    <Button size="sm" variant="outline" disabled={addingItem || !newItemName.trim()}
                                      onClick={async () => {
                                        const c = col ?? await ensureCollection(ct.type, ct.label);
                                        if (c) void addCollectionItem(c.id);
                                      }}
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Collapsible>

                  <Collapsible title="Milestones">
                    <div className="space-y-2">
                      {milestones.map(m => (
                        <div key={m.id} className="flex items-start justify-between gap-2 p-2.5 rounded-lg" style={{ background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))' }}>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'hsl(var(--foreground))' }}>{m.title}</p>
                            {m.milestoneDate && <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{m.milestoneDate}</p>}
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Select value={m.visibility} onValueChange={v => void updateMilestoneVis(m.id, v)}>
                              <SelectTrigger className="h-6 text-xs w-20"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="public">Public</SelectItem>
                                <SelectItem value="coven">Coven</SelectItem>
                                <SelectItem value="private">Private</SelectItem>
                              </SelectContent>
                            </Select>
                            <button onClick={() => void deleteMilestone(m.id)} className="text-destructive opacity-60 hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}
                      <div className="space-y-2 pt-1">
                        <Input value={newMilestoneTitle} onChange={e => setNewMilestoneTitle(e.target.value)} placeholder="Milestone title…" className="text-sm" />
                        <div className="flex gap-2">
                          <Input type="date" value={newMilestoneDate} onChange={e => setNewMilestoneDate(e.target.value)} className="text-sm flex-1" />
                          <Select value={newMilestoneVis} onValueChange={setNewMilestoneVis}>
                            <SelectTrigger className="w-24 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="coven">Coven</SelectItem>
                              <SelectItem value="private">Private</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Input value={newMilestoneNote} onChange={e => setNewMilestoneNote(e.target.value)} placeholder="Note (optional)…" className="text-sm" />
                        <Button size="sm" variant="outline" onClick={() => void addMilestone()} disabled={addingMilestone || !newMilestoneTitle.trim()} className="gap-1.5 text-xs">
                          <Plus className="w-3.5 h-3.5" /> Add milestone
                        </Button>
                      </div>
                    </div>
                  </Collapsible>
                </>
              )}

              {/* ════════════════════════════════════════════════════════════
                  MORE TAB
              ════════════════════════════════════════════════════════════ */}
              {activeTab === 'more' && (
                <>
                  <Collapsible title="Privacy & Visibility" defaultOpen>
                    <div className="space-y-4">
                      <Field label="Profile visibility">
                        <Select value={form.profileVisibility} onValueChange={v => set('profileVisibility', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public — anyone can view</SelectItem>
                            <SelectItem value="members">Members only</SelectItem>
                            <SelectItem value="private">Private — only you</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>

                      {/* ── Field-level visibility ── */}
                      <div className="pt-1">
                        <p className="text-xs font-medium mb-2" style={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'var(--font-sans)' }}>
                          Field visibility — control what each audience sees
                        </p>
                        <div className="space-y-2">
                          {(
                            [
                              { key: 'bioVisibility', label: 'Bio' },
                              { key: 'locationVisibility', label: 'Location' },
                              { key: 'zodiacVisibility', label: 'Zodiac signs' },
                              { key: 'socialLinksVisibility', label: 'Social links' },
                            ] as { key: keyof FormState; label: string }[]
                          ).map(({ key, label }) => (
                            <div key={key} className="flex items-center justify-between gap-2">
                              <span className="text-sm" style={{ color: 'hsl(var(--foreground))', fontFamily: 'var(--font-sans)' }}>{label}</span>
                              <Select value={String(form[key] ?? 'public')} onValueChange={v => set(key, v)}>
                                <SelectTrigger className="w-32 text-xs h-8"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="public">Public</SelectItem>
                                  <SelectItem value="coven">Coven only</SelectItem>
                                  <SelectItem value="private">Hidden</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ── Messaging & invites ── */}
                      <div className="pt-1 space-y-3 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
                        <p className="text-xs font-medium pt-2" style={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'var(--font-sans)' }}>
                          Messaging & invites
                        </p>
                        <Field label="Who can message me">
                          <Select value={messagePermission} onValueChange={setMessagePermission}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="everyone">Everyone</SelectItem>
                              <SelectItem value="coven">Coven only</SelectItem>
                              <SelectItem value="nobody">No one</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="Who can invite me to Coven">
                          <Select value={invitePermission} onValueChange={setInvitePermission}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="everyone">Everyone</SelectItem>
                              <SelectItem value="nobody">No one</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>

                      {/* ── Online status ── */}
                      <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
                        <div className="pt-2">
                          <p className="text-sm" style={{ color: 'hsl(var(--foreground))', fontFamily: 'var(--font-sans)' }}>Hide online status</p>
                          <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))', fontFamily: 'var(--font-sans)' }}>Others won't see when you're active</p>
                        </div>
                        <button
                          onClick={() => void saveHideOnlineStatus(!hideOnlineStatus)}
                          className="text-xs px-3 py-1 rounded-full border transition-all mt-2"
                          style={{
                            borderColor: hideOnlineStatus ? accent : 'hsl(var(--border))',
                            background: hideOnlineStatus ? `${accent}20` : 'transparent',
                            color: hideOnlineStatus ? accent : 'hsl(var(--muted-foreground))',
                          }}
                          aria-pressed={hideOnlineStatus}
                        >
                          {hideOnlineStatus ? 'Hidden' : 'Visible'}
                        </button>
                      </div>
                    </div>
                  </Collapsible>

                  <Collapsible title="Section Visibility & Order" defaultOpen>
                    <p className="text-xs mb-3" style={{ color: 'hsl(var(--muted-foreground))' }}>Toggle and reorder sections on your public profile.</p>
                    <div className="space-y-2">
                      {[...form.profileSections]
                        .sort((a, b) => a.order - b.order)
                        .map((sec, idx) => {
                          const meta = DEFAULT_SECTIONS.find(s => s.id === sec.id);
                          if (!meta) return null;
                          return (
                            <div key={sec.id} className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))' }}>
                              <div className="flex flex-col gap-0.5">
                                <button
                                  onClick={() => {
                                    if (idx === 0) return;
                                    const arr = [...form.profileSections].sort((a, b) => a.order - b.order);
                                    const prev = arr[idx - 1]; const curr = arr[idx];
                                    set('profileSections', form.profileSections.map(s =>
                                      s.id === curr.id ? { ...s, order: prev.order } :
                                      s.id === prev.id ? { ...s, order: curr.order } : s
                                    ));
                                  }}
                                  disabled={idx === 0}
                                  className="text-xs px-1 disabled:opacity-30"
                                  style={{ color: 'hsl(var(--muted-foreground))' }}
                                  aria-label="Move up"
                                >▲</button>
                                <button
                                  onClick={() => {
                                    const arr = [...form.profileSections].sort((a, b) => a.order - b.order);
                                    if (idx === arr.length - 1) return;
                                    const next = arr[idx + 1]; const curr = arr[idx];
                                    set('profileSections', form.profileSections.map(s =>
                                      s.id === curr.id ? { ...s, order: next.order } :
                                      s.id === next.id ? { ...s, order: curr.order } : s
                                    ));
                                  }}
                                  disabled={idx === form.profileSections.length - 1}
                                  className="text-xs px-1 disabled:opacity-30"
                                  style={{ color: 'hsl(var(--muted-foreground))' }}
                                  aria-label="Move down"
                                >▼</button>
                              </div>
                              <span className="flex-1 text-sm" style={{ color: 'hsl(var(--foreground))' }}>{meta.label}</span>
                              <button
                                onClick={() => set('profileSections', form.profileSections.map(s =>
                                  s.id === sec.id ? { ...s, enabled: !s.enabled } : s
                                ))}
                                className="text-xs px-3 py-1 rounded-full border transition-all"
                                style={{
                                  borderColor: sec.enabled ? accent : 'hsl(var(--border))',
                                  background: sec.enabled ? `${accent}20` : 'transparent',
                                  color: sec.enabled ? accent : 'hsl(var(--muted-foreground))',
                                }}
                              >
                                {sec.enabled ? 'Visible' : 'Hidden'}
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  </Collapsible>

                  <Collapsible title="Soundscapes">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>Enable soundscapes</span>
                        <button
                          onClick={() => { const v = !soundscapesEnabled; setSoundscapesEnabled(v); void saveSoundscapesSettings({ enabled: v }); }}
                          className="text-xs px-3 py-1 rounded-full border transition-all"
                          style={{
                            borderColor: soundscapesEnabled ? accent : 'hsl(var(--border))',
                            background: soundscapesEnabled ? `${accent}20` : 'transparent',
                            color: soundscapesEnabled ? accent : 'hsl(var(--muted-foreground))',
                          }}
                        >
                          {soundscapesEnabled ? 'On' : 'Off'}
                        </button>
                      </div>
                      {soundscapesEnabled && (
                        <>
                          <Field label="Visibility">
                            <Select value={soundscapesVis} onValueChange={v => { setSoundscapesVis(v); void saveSoundscapesSettings({ visibility: v }); }}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="public">Public</SelectItem>
                                <SelectItem value="coven">Coven only</SelectItem>
                                <SelectItem value="private">Private</SelectItem>
                              </SelectContent>
                            </Select>
                          </Field>
                          <div className="space-y-2">
                            {playlists.map(pl => (
                              <div key={pl.id} className="flex items-center justify-between gap-2 p-2.5 rounded-lg text-xs" style={{ background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))' }}>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate" style={{ color: 'hsl(var(--foreground))' }}>{pl.customTitle || pl.provider}</p>
                                  <a href={pl.canonicalUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 opacity-60 hover:opacity-100" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                    <ExternalLink className="w-3 h-3" /> {pl.provider}
                                  </a>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <button onClick={() => void setFeaturedPlaylist(pl.id, 'isCurrentVibe')} className="px-2 py-0.5 rounded-full border text-xs transition-all" style={{ borderColor: pl.isCurrentVibe ? accent : 'hsl(var(--border))', color: pl.isCurrentVibe ? accent : 'hsl(var(--muted-foreground))' }}>Vibe</button>
                                  <button onClick={() => void deletePlaylist(pl.id)} className="text-destructive opacity-60 hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
                                </div>
                              </div>
                            ))}
                            <div className="space-y-1.5 pt-1">
                              <Input value={newPlaylistUrl} onChange={e => setNewPlaylistUrl(e.target.value)} placeholder="Spotify / Apple Music URL…" className="text-sm" />
                              <Input value={newPlaylistTitle} onChange={e => setNewPlaylistTitle(e.target.value)} placeholder="Custom title (optional)" className="text-sm" />
                              {playlistError && <p className="text-xs text-destructive">{playlistError}</p>}
                              <Button size="sm" variant="outline" onClick={() => void addPlaylist()} disabled={addingPlaylist || !newPlaylistUrl.trim()} className="gap-1.5 text-xs">
                                <Plus className="w-3.5 h-3.5" /> Add playlist
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </Collapsible>

                  <Collapsible title="Guestbook">
                    {guestbookLoading ? (
                      <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Loading…</p>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>Enable guestbook</span>
                          <button
                            onClick={() => { const v = !guestbookEnabled; setGuestbookEnabled(v); void saveGuestbookSettings({ enabled: v }); }}
                            className="text-xs px-3 py-1 rounded-full border transition-all"
                            style={{
                              borderColor: guestbookEnabled ? accent : 'hsl(var(--border))',
                              background: guestbookEnabled ? `${accent}20` : 'transparent',
                              color: guestbookEnabled ? accent : 'hsl(var(--muted-foreground))',
                            }}
                          >
                            {guestbookEnabled ? 'On' : 'Off'}
                          </button>
                        </div>
                        {guestbookEnabled && (
                          <>
                            <Field label="Who can leave messages">
                              <Select value={guestbookSubmitters} onValueChange={v => { setGuestbookSubmitters(v); void saveGuestbookSettings({ allowedSubmitters: v }); }}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="public">Anyone</SelectItem>
                                  <SelectItem value="members">Members</SelectItem>
                                  <SelectItem value="coven">Coven only</SelectItem>
                                </SelectContent>
                              </Select>
                            </Field>
                            <Field label="Who can see entries">
                              <Select value={guestbookVis} onValueChange={v => { setGuestbookVis(v); void saveGuestbookSettings({ visibility: v }); }}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="public">Public</SelectItem>
                                  <SelectItem value="members">Members</SelectItem>
                                  <SelectItem value="coven">Coven only</SelectItem>
                                </SelectContent>
                              </Select>
                            </Field>
                            <div className="flex items-center justify-between">
                              <span className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>Require approval</span>
                              <button
                                onClick={() => { const v = !guestbookApproval; setGuestbookApproval(v); void saveGuestbookSettings({ requireApproval: v }); }}
                                className="text-xs px-3 py-1 rounded-full border transition-all"
                                style={{
                                  borderColor: guestbookApproval ? accent : 'hsl(var(--border))',
                                  background: guestbookApproval ? `${accent}20` : 'transparent',
                                  color: guestbookApproval ? accent : 'hsl(var(--muted-foreground))',
                                }}
                              >
                                {guestbookApproval ? 'Yes' : 'No'}
                              </button>
                            </div>
                            {guestbookEntries.length > 0 && (
                              <div className="space-y-2 pt-1">
                                <p className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>Entries ({guestbookEntries.length})</p>
                                {guestbookEntries.map(e => (
                                  <div key={e.id} className="p-2.5 rounded-lg space-y-1.5" style={{ background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))' }}>
                                    <p className="text-xs" style={{ color: 'hsl(var(--foreground))' }}>{e.text}</p>
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>@{e.authorUsername ?? 'anonymous'} · {e.moderationState}</span>
                                      <div className="flex gap-1.5">
                                        {e.moderationState === 'pending' && (
                                          <>
                                            <button onClick={() => void moderateEntry(e.id, 'approved')} className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${accent}20`, color: accent }}>Approve</button>
                                            <button onClick={() => void moderateEntry(e.id, 'rejected')} className="text-xs px-2 py-0.5 rounded-full text-destructive" style={{ background: 'hsl(var(--destructive) / 0.1)' }}>Reject</button>
                                          </>
                                        )}
                                        <button onClick={() => void deleteEntry(e.id)} className="text-destructive opacity-60 hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </Collapsible>

                  <Collapsible title="Creator / Organization Application">
                    {appStatusLoading ? (
                      <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Loading…</p>
                    ) : appStatus ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          {appStatus.status === 'approved' && <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'hsl(var(--success))' }} />}
                          {appStatus.status === 'pending_review' && <Clock className="w-4 h-4 shrink-0" style={{ color: 'hsl(var(--warning))' }} />}
                          {appStatus.status === 'info_requested' && <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: 'hsl(var(--warning))' }} />}
                          {appStatus.status === 'rejected' && <X className="w-4 h-4 shrink-0 text-destructive" />}
                          {appStatus.status === 'withdrawn' && <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />}
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))', fontFamily: 'var(--font-heading)' }}>
                              {appStatus.requestedAccountType === 'organization' ? 'Organization' : 'Creator'} Application
                            </p>
                            <p className="text-xs capitalize" style={{ color: 'hsl(var(--muted-foreground))' }}>
                              {appStatus.status.replace(/_/g, ' ')}
                            </p>
                          </div>
                        </div>
                        {appStatus.reviewReason && (
                          <div className="rounded-lg p-3 text-xs leading-relaxed" style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}>
                            {appStatus.reviewReason}
                          </div>
                        )}
                        {appStatus.status === 'info_requested' && (
                          <Link to={`/creator-application?type=${appStatus.requestedAccountType}`}>
                            <Button size="sm" variant="outline" className="gap-1.5 text-xs w-full">
                              <FileText className="w-3.5 h-3.5" /> Respond to Request
                            </Button>
                          </Link>
                        )}
                        {(appStatus.status === 'rejected' || appStatus.status === 'withdrawn') && (
                          <Link to={`/creator-application?type=${appStatus.requestedAccountType}`}>
                            <Button size="sm" variant="outline" className="gap-1.5 text-xs w-full">
                              <FileText className="w-3.5 h-3.5" /> Reapply
                            </Button>
                          </Link>
                        )}
                        <p className="text-[10px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          Submitted {new Date(appStatus.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          Apply to become a verified Creator or Organization on Spellful.
                        </p>
                        <div className="flex flex-col gap-2">
                          <Link to="/creator-application?type=creator">
                            <Button size="sm" variant="outline" className="gap-1.5 text-xs w-full">
                              <Sparkles className="w-3.5 h-3.5" /> Apply as Creator
                            </Button>
                          </Link>
                          <Link to="/creator-application?type=organization">
                            <Button size="sm" variant="outline" className="gap-1.5 text-xs w-full">
                              <Wand2 className="w-3.5 h-3.5" /> Apply as Organization
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </Collapsible>

                  <Collapsible title="Advanced">
                    <p className="text-xs mb-3" style={{ color: 'hsl(var(--muted-foreground))' }}>View your public profile as others see it.</p>
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => navigate(`/u/${(session?.user as SessionUser | undefined)?.username ?? ''}`)}>
                      <ExternalLink className="w-3.5 h-3.5" /> View public profile
                    </Button>
                  </Collapsible>
                </>
              )}

            </motion.div>
          </AnimatePresence>

          {/* ── Install Spellful ── */}
          <InstallSection />

          {/* ── Save bar ── */}
          <div
            className="sticky bottom-4 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 transition-all"
            style={{
              background: isDirty ? 'hsl(var(--card))' : 'hsl(var(--muted))',
              border: `1px solid ${isDirty ? accent : 'hsl(var(--border))'}`,
              boxShadow: isDirty ? `0 4px 24px ${accent}25` : 'none',
            }}
          >
            <div className="flex items-center gap-2">
              {isDirty && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: accent }} />}
              <span className="text-xs" style={{ color: isDirty ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}>
                {saved ? 'All changes saved' : isDirty ? 'Unsaved changes' : 'No changes'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isDirty && (
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setForm(original); setSaved(false); setError(''); }}>
                  Discard
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => void handleSave()}
                disabled={saving || !isDirty}
                className="gap-1.5 text-xs"
                style={isDirty ? { background: accent, color: 'hsl(var(--primary-foreground))', border: 'none' } : {}}
              >
                {saving ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                    Saving…
                  </span>
                ) : saved ? (
                  <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Saved</span>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-center text-destructive pb-2">{error}</p>
          )}

        </div>
      </main>
    </>
  );
}
