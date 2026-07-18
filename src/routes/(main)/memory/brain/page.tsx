'use client';

import { useEffect, useRef, useState } from 'react';

// ── Types ──────────────────────────────────────────────────────────
interface MemoryCell {
  date: string;
  fileCode?: string;
  hits: number;
  id: string;
  pvt?: boolean;
  text: string;
  time: string;
  topic?: string;
}

interface MemorySub {
  cells: MemoryCell[];
  desc: string;
  id: string;
  name: string;
  parentId?: string;
}

interface MemoryFolder {
  cells?: MemoryCell[];
  desc: string;
  id: string;
  isVault?: boolean;
  name: string;
  subs?: MemorySub[];
}

// Convert API structure + memories into MemoryFolder[]
const buildDBFromStructure = (structure: any, memories: any[]): MemoryFolder[] => {
  const db: MemoryFolder[] = [];
  Object.entries(structure).forEach(([letter, block]: [string, any]) => {
    const subs: MemorySub[] = Object.entries(block.sub_folders || {}).map(
      ([subCode, subName]: [string, any]) => {
        const subMemories = memories.filter((m: any) => m.sub_code === subCode);
        const cells: MemoryCell[] = subMemories.map((m: any) => {
          const d = new Date(m.created_at || Date.now());
          return {
            id: m.id,
            text: m.memory,
            topic: m.sub_name || subName,
            date: d.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            hits: Math.round((m.salience || 0.5) * 10),
            pvt: m.sensitivity === 'sensitive',
            fileCode: m.file_code || '',
          };
        });
        return { id: subCode, name: subName, desc: subCode, cells, parentId: letter };
      },
    );
    db.push({ id: letter, name: block.block_name, desc: block.folder, subs });
  });
  const privateMemories = memories.filter((m: any) => m.sensitivity === 'sensitive');
  db.push({
    id: 'vault',
    name: 'Private',
    desc: 'PIN protected',
    isVault: true,
    cells: privateMemories.map((m: any) => {
      const d = new Date(m.created_at || Date.now());
      return {
        id: m.id,
        text: m.memory,
        topic: m.folder,
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        hits: Math.round((m.salience || 0.5) * 10),
        pvt: true,
        fileCode: m.file_code || '',
      };
    }),
  });
  return db;
};

const DEFAULT_DB: MemoryFolder[] = [
  {
    id: 'health',
    name: 'Health',
    desc: 'Vitals · Medical',
    subs: [
      { id: 'health-mind', name: 'Mind', desc: 'Mental health', cells: [], parentId: 'health' },
      { id: 'health-body', name: 'Body', desc: 'Physical health', cells: [], parentId: 'health' },
    ],
  },
  {
    id: 'work',
    name: 'Work',
    desc: 'Career · Projects',
    subs: [
      { id: 'work-role', name: 'Role', desc: 'Title & position', cells: [], parentId: 'work' },
      { id: 'work-projects', name: 'Projects', desc: 'Active work', cells: [], parentId: 'work' },
    ],
  },
  {
    id: 'money',
    name: 'Money',
    desc: 'Finance · Capital',
    subs: [
      { id: 'money-income', name: 'Income', desc: 'Earnings', cells: [], parentId: 'money' },
      {
        id: 'money-debt',
        name: 'Obligations',
        desc: 'Debt & runway',
        cells: [],
        parentId: 'money',
      },
    ],
  },
  {
    id: 'people',
    name: 'People',
    desc: 'Relations · Circle',
    subs: [
      {
        id: 'people-family',
        name: 'Family',
        desc: 'Family members',
        cells: [],
        parentId: 'people',
      },
      {
        id: 'people-work',
        name: 'Collaborators',
        desc: 'Work relationships',
        cells: [],
        parentId: 'people',
      },
    ],
  },
  {
    id: 'life',
    name: 'Life',
    desc: 'Goals · Direction',
    subs: [
      { id: 'life-goals', name: 'Goals', desc: 'What you want', cells: [], parentId: 'life' },
      { id: 'life-events', name: 'Events', desc: 'What happened', cells: [], parentId: 'life' },
    ],
  },
  { id: 'vault', name: 'Private', desc: 'PIN protected', isVault: true, cells: [] },
];

const RL = (i: number) => String.fromCharCode(65 + i);
const today = () =>
  new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const nowt = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const allCells = (f: MemoryFolder) =>
  f.subs ? f.subs.reduce((s, sf) => s + sf.cells.length, 0) : f.cells?.length || 0;

// ── PIN Lock ───────────────────────────────────────────────────────
const PinModal = ({
  label,
  onSuccess,
  onCancel,
}: {
  label: string;
  onSuccess: () => void;
  onCancel: () => void;
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showReset, setShowReset] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetOtp, setResetOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [resetMsg, setResetMsg] = useState('');

  const pressKey = async (k: string) => {
    if (pin.length >= 4 || loading) return;
    const np = pin + k;
    setPin(np);
    if (np.length === 4) {
      setLoading(true);
      setTimeout(async () => {
        try {
          const res = await fetch('/api/vault/pin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'verify', pin: np }),
          });
          const data = await res.json();
          if (data.success) {
            onSuccess();
            setPin('');
          } else {
            setShake(true);
            setError(data.error || 'Incorrect PIN');
            // Show reset option if locked
            if (data.code === 'LOCKED' || data.attemptsRemaining === 0) {
              setShowReset(true);
            }
            setTimeout(() => {
              setPin('');
              setShake(false);
              setError('');
              setLoading(false);
            }, 700);
          }
        } catch {
          setShake(true);
          setError('Connection error — try again');
          setTimeout(() => {
            setPin('');
            setShake(false);
            setError('');
            setLoading(false);
          }, 700);
        }
      }, 80);
    }
  };

  const requestOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vault/pin-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_otp' }),
      });
      const data = await res.json();
      if (data.success) {
        setResetStep('verify');
        setResetMsg(`Code sent to ${data.maskedEmail}`);
      } else {
        setResetMsg(data.error || 'Failed to send code');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetPin = async () => {
    if (!resetOtp || !newPin) return;
    setLoading(true);
    try {
      const res = await fetch('/api/vault/pin-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', otp: resetOtp, newPin }),
      });
      const data = await res.json();
      if (data.success) {
        setResetMsg('PIN reset! You can now log in with your new PIN.');
        setShowReset(false);
        setResetStep('request');
        setResetOtp('');
        setNewPin('');
      } else {
        setResetMsg(data.error || 'Reset failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '←'];

  // ── Reset flow UI ─────────────────────────────────────────────────────────
  if (showReset) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(248,248,248,0.97)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          zIndex: 700,
          padding: 24,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#111' }}>
          Reset Vault PIN
        </div>
        {resetMsg && (
          <div style={{ fontSize: 13, color: '#555', marginBottom: 16, textAlign: 'center' }}>
            {resetMsg}
          </div>
        )}
        {resetStep === 'request' && (
          <>
            <div
              style={{
                fontSize: 13,
                color: '#777',
                marginBottom: 24,
                textAlign: 'center',
                maxWidth: 280,
              }}
            >
              We will send a 6-digit code to your email to reset your PIN.
            </div>
            <button
              disabled={loading}
              style={{
                background: '#111',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '12px 32px',
                fontSize: 14,
                cursor: 'pointer',
                marginBottom: 12,
              }}
              onClick={requestOtp}
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </>
        )}
        {resetStep === 'verify' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 280 }}>
            <input
              placeholder="6-digit email code"
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #ddd',
                fontSize: 15,
                textAlign: 'center',
                letterSpacing: 4,
              }}
              value={resetOtp}
              onChange={(e) => setResetOtp(e.target.value.replaceAll(/\D/g, '').slice(0, 6))}
            />
            <input
              placeholder="New PIN (4-6 digits)"
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #ddd',
                fontSize: 15,
                textAlign: 'center',
                letterSpacing: 4,
              }}
              type="password"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replaceAll(/\D/g, '').slice(0, 6))}
            />
            <button
              disabled={loading || resetOtp.length !== 6 || newPin.length < 4}
              style={{
                background: '#111',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '12px 32px',
                fontSize: 14,
                cursor: 'pointer',
              }}
              onClick={resetPin}
            >
              {loading ? 'Resetting...' : 'Reset PIN'}
            </button>
          </div>
        )}
        <button
          style={{
            marginTop: 16,
            fontSize: 13,
            color: '#888',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={() => {
            setShowReset(false);
            setResetStep('request');
            setResetMsg('');
          }}
        >
          Back to PIN entry
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(248,248,248,0.97)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        zIndex: 700,
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: '#333',
          fontWeight: 500,
          marginBottom: 3,
          textAlign: 'center',
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 10, color: '#bbb', marginBottom: 24 }}>
        Enter your PIN to continue
      </div>
      <div
        style={{
          display: 'flex',
          gap: 11,
          marginBottom: 26,
          animation: shake ? 'shake 0.4s ease' : 'none',
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              border: `1.5px solid ${pin.length > i ? '#333' : '#ccc'}`,
              background: pin.length > i ? '#333' : 'transparent',
              transition: 'all .1s',
            }}
          />
        ))}
      </div>
      {error && (
        <div
          style={{
            fontSize: 9,
            color: '#c00',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          {error}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 62px)', gap: 7 }}>
        {keys.map((k, i) => (
          <button
            key={i}
            style={{
              width: 62,
              height: 62,
              border: k ? '1px solid #e0e0e0' : 'none',
              background: k ? '#fff' : 'transparent',
              borderRadius: 2,
              fontSize: k === '←' ? 13 : 20,
              fontWeight: 300,
              color: '#333',
              cursor: k ? 'pointer' : 'default',
              fontFamily: 'inherit',
            }}
            onClick={() => {
              if (k === '←') setPin((p) => p.slice(0, -1));
              else if (k) pressKey(k);
            }}
          >
            {k}
          </button>
        ))}
      </div>
      <div
        style={{
          fontSize: 9,
          color: '#ccc',
          marginTop: 13,
          cursor: 'pointer',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
        onClick={onCancel}
      >
        Cancel
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────
export default function FiMemoryBrain() {
  const [db, setDb] = useState<MemoryFolder[]>(DEFAULT_DB);
  const [loadingMemories, setLoadingMemories] = useState(true);
  const [level, setLevel] = useState(0);

  // Load real memories + structure from Fi API
  useEffect(() => {
    const load = async () => {
      try {
        const userId = 'cts13677';
        const API = process.env.NEXT_PUBLIC_FI_API_URL || 'http://localhost:8008';
        const KEY = '0gw1eTGuCyE64Q9jswo-NnzX7tzq49zdaO6msc1w47g';
        const headers = { 'X-Fi-API-Key': KEY };
        const [structRes, memRes] = await Promise.all([
          fetch(`${API}/memory/structure/${userId}`, { headers }),
          fetch(`${API}/memory/get/${userId}?include_sensitive=true`, { headers }),
        ]);
        const structData = await structRes.json();
        const memData = await memRes.json();
        if (structData.status === 'ok' && memData.status === 'ok') {
          const built = buildDBFromStructure(structData.blocks || {}, memData.memories || []);
          if (built.length > 0) setDb(built);
        }
      } catch (e) {
        console.error('Failed to load memories:', e);
      } finally {
        setLoadingMemories(false);
      }
    };
    load();
  }, []);
  const [curFolder, setCurFolder] = useState<MemoryFolder | null>(null);
  const [curSub, setCurSub] = useState<MemorySub | null>(null);
  const [curCell, setCurCell] = useState<{
    cell: MemoryCell;
    sf: MemorySub;
    f: MemoryFolder;
  } | null>(null);
  const [pinOk, setPinOk] = useState(false);
  const [pinModal, setPinModal] = useState<{ label: string; cb: () => void } | null>(null);
  const [pinSetupMode, setPinSetupMode] = useState(false);
  const [setupPin, setSetupPin] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const [setupError, setSetupError] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [hasPinChecked, setHasPinChecked] = useState(false);
  const [totpModal, setTotpModal] = useState<{ label: string; cb: () => void } | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [totpError, setTotpError] = useState('');
  const [totpLoading, setTotpLoading] = useState(false);
  const [totpEnabled, setTotpEnabled] = useState(false);

  // Check TOTP status on mount
  useEffect(() => {
    fetch('/api/vault/totp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'status' }),
    })
      .then((r) => r.json())
      .then((d) => setTotpEnabled(d.totpEnabled))
      .catch(() => {});
  }, []);

  const requireTotp = (label: string, cb: () => void) => {
    if (!totpEnabled) {
      cb();
      return;
    } // Skip TOTP if not set up
    setTotpModal({ label, cb });
    setTotpCode('');
    setTotpError('');
  };

  const verifyTotp = async () => {
    if (!totpCode || totpCode.length !== 6) return;
    setTotpLoading(true);
    try {
      const res = await fetch('/api/vault/totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', token: totpCode }),
      });
      const d = await res.json();
      if (d.success) {
        totpModal?.cb();
        setTotpModal(null);
        setTotpCode('');
      } else {
        setTotpError(d.error || 'Invalid code');
      }
    } finally {
      setTotpLoading(false);
    }
  };

  // Check if user has a PIN set on mount
  useEffect(() => {
    fetch('/api/vault/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'status' }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (!d.hasPin) setPinSetupMode(true);
        setHasPinChecked(true);
      })
      .catch(() => setHasPinChecked(true));
  }, []);

  const handleSetupPin = async () => {
    if (setupPin.length < 4) {
      setSetupError('PIN must be at least 4 digits');
      return;
    }
    if (setupPin !== setupConfirm) {
      setSetupError('PINs do not match');
      return;
    }
    setSetupLoading(true);
    try {
      const res = await fetch('/api/vault/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setup', pin: setupPin }),
      });
      const d = await res.json();
      if (d.success) {
        setPinSetupMode(false);
        setSetupPin('');
        setSetupConfirm('');
      } else {
        setSetupError(d.error || 'Setup failed');
      }
    } finally {
      setSetupLoading(false);
    }
  };
  const [rpOpen, setRpOpen] = useState(false);
  const [fiMsg, setFiMsg] = useState('');
  const [fiOn, setFiOn] = useState(false);
  const fiTimer = useRef<any>(null);

  const nv = () => db.filter((f) => !f.isVault);
  const vault = () => db.find((f) => f.isVault)!;
  const totalCells = () => nv().reduce((s, f) => s + allCells(f), 0);

  const fi = (msg: string, dur = 1600) => {
    setFiMsg(msg);
    setFiOn(true);
    clearTimeout(fiTimer.current);
    if (dur > 0) fiTimer.current = setTimeout(() => setFiOn(false), dur);
  };

  const requirePin = (label: string, cb: () => void) => {
    if (pinOk) {
      cb();
      return;
    }
    setPinModal({ label, cb });
  };

  const pinSuccess = () => {
    setPinOk(true);
    pinModal?.cb();
    setPinModal(null);
  };

  const closeRP = () => {
    setRpOpen(false);
    setCurCell(null);
  };

  // ── DIE MAP SVG ────────────────────────────────────────────────
  const renderDie = () => {
    const folders = nv();
    const vlt = vault();
    const f0 = folders[0],
      f1 = folders[1],
      f2 = folders[2],
      f3 = folders[3],
      f4 = folders[4];

    const badge = (n: number, x: number, y: number) =>
      `<rect x="${x}" y="${y}" width="20" height="13" fill="#aaa" rx="2"/>` +
      `<text x="${x + 10}" y="${y + 9.5}" text-anchor="middle" font-size="6.5" fill="#fff" font-weight="500">${n}</text>`;

    const lockIcon = (cx: number, cy: number) =>
      `<rect x="${cx - 6}" y="${cy}" width="12" height="9" rx="2" fill="none" stroke="#ccc" stroke-width="1.3"/>` +
      `<path d="M${cx - 3.5} ${cy} Q${cx - 3.5} ${cy - 5} ${cx} ${cy - 5} Q${cx + 3.5} ${cy - 5} ${cx + 3.5} ${cy}" fill="none" stroke="#ccc" stroke-width="1.3"/>` +
      `<circle cx="${cx}" cy="${cy + 4.5}" r="1.5" fill="#ccc"/>`;

    return `<svg width="100%" height="100%" viewBox="0 0 680 380" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style="display:block;position:absolute;inset:0;width:100%;height:100%" font-family="-apple-system,'SF Pro Text',sans-serif">
  <rect x="0" y="0" width="247" height="189" fill="#fff" stroke="#ddd" stroke-width="0.5"/>
  ${badge(allCells(f0), 5, 5)}
  <text x="123" y="88" text-anchor="middle" font-size="10" fill="#111" letter-spacing="2.5" font-weight="500">${f0?.name?.toUpperCase()}</text>
  <text x="123" y="102" text-anchor="middle" font-size="6.5" fill="#ccc" letter-spacing="2">A BLOCK</text>
  <rect x="0" y="0" width="247" height="189" fill="transparent" stroke="none" style="cursor:pointer" data-folder="${f0?.id}"/>

  <rect x="249" y="0" width="197" height="94" fill="#fff" stroke="#ddd" stroke-width="0.5"/>
  ${badge(allCells(f1), 253, 5)}
  <text x="347" y="42" text-anchor="middle" font-size="9" fill="#111" letter-spacing="2" font-weight="500">${f1?.name?.toUpperCase()}</text>
  <text x="347" y="55" text-anchor="middle" font-size="6.5" fill="#ccc" letter-spacing="2">B BLOCK</text>
  <rect x="249" y="0" width="197" height="94" fill="transparent" stroke="none" style="cursor:pointer" data-folder="${f1?.id}"/>

  <rect x="249" y="96" width="197" height="93" fill="#fff" stroke="#ddd" stroke-width="0.5"/>
  ${badge(allCells(f2), 253, 101)}
  <text x="347" y="137" text-anchor="middle" font-size="9" fill="#111" letter-spacing="2" font-weight="500">${f2?.name?.toUpperCase()}</text>
  <text x="347" y="150" text-anchor="middle" font-size="6.5" fill="#ccc" letter-spacing="2">C BLOCK</text>
  <rect x="249" y="96" width="197" height="93" fill="transparent" stroke="none" style="cursor:pointer" data-folder="${f2?.id}"/>

  <rect x="447" y="0" width="147" height="189" fill="#fff" stroke="#ddd" stroke-width="0.5"/>
  ${badge(allCells(f3), 451, 5)}
  <text x="520" y="88" text-anchor="middle" font-size="9" fill="#111" letter-spacing="2" font-weight="500">${f3?.name?.toUpperCase()}</text>
  <text x="520" y="101" text-anchor="middle" font-size="6.5" fill="#ccc" letter-spacing="2">D BLOCK</text>
  <rect x="447" y="0" width="147" height="189" fill="transparent" stroke="none" style="cursor:pointer" data-folder="${f3?.id}"/>

  <rect x="596" y="0" width="84" height="94" fill="#f0f0f0" stroke="#ddd" stroke-width="0.5"/>
  <text x="638" y="47" text-anchor="middle" font-size="6.5" fill="#aaa" letter-spacing="1.5" transform="rotate(-90 638 47)">INDEX · IO</text>

  <rect x="596" y="96" width="84" height="93" fill="#fff" stroke="#ddd" stroke-width="0.5" style="cursor:pointer" data-vault="true"/>
  ${badge(vlt?.cells?.length || 0, 600, 101)}
  ${lockIcon(638, 128)}
  <text x="638" y="172" text-anchor="middle" font-size="6.5" fill="#ccc" letter-spacing="1.5" transform="rotate(-90 638 172)" style="pointer-events:none">PRIVATE</text>

  <rect x="0" y="191" width="85" height="94" fill="#f0f0f0" stroke="#ddd" stroke-width="0.5"/>
  <text x="42" y="238" text-anchor="middle" font-size="6.5" fill="#aaa" letter-spacing="1.5" transform="rotate(-90 42 238)">INDEX · IO</text>
  <rect x="0" y="287" width="85" height="93" fill="#ebebeb" stroke="#ddd" stroke-width="0.5"/>
  <text x="42" y="333" text-anchor="middle" font-size="6.5" fill="#aaa" letter-spacing="1.5" transform="rotate(-90 42 333)">QUEUE BUS</text>

  <rect x="87" y="191" width="160" height="189" fill="#fff" stroke="#ddd" stroke-width="0.5"/>
  ${badge(allCells(f3), 91, 196)}
  <text x="167" y="278" text-anchor="middle" font-size="9" fill="#111" letter-spacing="2" font-weight="500">${f3?.name?.toUpperCase()}</text>
  <text x="167" y="291" text-anchor="middle" font-size="6.5" fill="#ccc" letter-spacing="2">D BLOCK</text>
  <rect x="87" y="191" width="160" height="189" fill="transparent" stroke="none" style="cursor:pointer" data-folder="${f3?.id}"/>

  <rect x="249" y="191" width="98" height="94" fill="#fff" stroke="#ddd" stroke-width="0.5"/>
  ${badge(f1?.subs?.[0]?.cells?.length || 0, 253, 196)}
  <text x="298" y="232" text-anchor="middle" font-size="7.5" fill="#111" letter-spacing="1.5" font-weight="500">${(f1?.subs?.[0]?.name || f1?.name || '').toUpperCase()}</text>
  <text x="298" y="244" text-anchor="middle" font-size="6" fill="#ccc" letter-spacing="1">B BLOCK</text>
  <rect x="249" y="191" width="98" height="94" fill="transparent" stroke="none" style="cursor:pointer" data-folder="${f1?.id}"/>

  <rect x="349" y="191" width="96" height="94" fill="#fff" stroke="#ddd" stroke-width="0.5"/>
  ${badge(f1?.subs?.[1]?.cells?.length || 0, 353, 196)}
  <text x="397" y="232" text-anchor="middle" font-size="7.5" fill="#111" letter-spacing="1.5" font-weight="500">${(f1?.subs?.[1]?.name || f1?.name || '').toUpperCase()}</text>
  <text x="397" y="244" text-anchor="middle" font-size="6" fill="#ccc" letter-spacing="1">B BLOCK</text>
  <rect x="349" y="191" width="96" height="94" fill="transparent" stroke="none" style="cursor:pointer" data-folder="${f1?.id}"/>

  <rect x="249" y="287" width="196" height="93" fill="#fff" stroke="#ddd" stroke-width="0.5"/>
  ${badge(allCells(f2), 253, 292)}
  <text x="347" y="328" text-anchor="middle" font-size="9" fill="#111" letter-spacing="2" font-weight="500">${f2?.name?.toUpperCase()}</text>
  <text x="347" y="341" text-anchor="middle" font-size="6.5" fill="#ccc" letter-spacing="2">C BLOCK</text>
  <rect x="249" y="287" width="196" height="93" fill="transparent" stroke="none" style="cursor:pointer" data-folder="${f2?.id}"/>

  <rect x="447" y="191" width="116" height="94" fill="#fff" stroke="#ddd" stroke-width="0.5"/>
  ${badge(f4?.subs?.[0]?.cells?.length || 0, 451, 196)}
  <text x="505" y="232" text-anchor="middle" font-size="7.5" fill="#111" letter-spacing="1.5" font-weight="500">${(f4?.subs?.[0]?.name || f4?.name || '').toUpperCase()}</text>
  <text x="505" y="244" text-anchor="middle" font-size="6" fill="#ccc" letter-spacing="1">E BLOCK</text>
  <rect x="447" y="191" width="116" height="94" fill="transparent" stroke="none" style="cursor:pointer" data-folder="${f4?.id}"/>

  <rect x="565" y="191" width="115" height="94" fill="#fff" stroke="#ddd" stroke-width="0.5"/>
  ${badge(f4?.subs?.[1]?.cells?.length || 0, 569, 196)}
  <text x="622" y="232" text-anchor="middle" font-size="7.5" fill="#111" letter-spacing="1.5" font-weight="500">${(f4?.subs?.[1]?.name || f4?.name || '').toUpperCase()}</text>
  <text x="622" y="244" text-anchor="middle" font-size="6" fill="#ccc" letter-spacing="1">E BLOCK</text>
  <rect x="565" y="191" width="115" height="94" fill="transparent" stroke="none" style="cursor:pointer" data-folder="${f4?.id}"/>

  <rect x="447" y="287" width="233" height="93" fill="#fff" stroke="#ddd" stroke-width="0.5"/>
  ${badge(allCells(f4), 451, 292)}
  <text x="563" y="328" text-anchor="middle" font-size="9" fill="#111" letter-spacing="2" font-weight="500">${f4?.name?.toUpperCase()}</text>
  <text x="563" y="341" text-anchor="middle" font-size="6.5" fill="#ccc" letter-spacing="2">E BLOCK</text>
  <rect x="447" y="287" width="233" height="93" fill="transparent" stroke="none" style="cursor:pointer" data-folder="${f4?.id}"/>
</svg>`;
  };

  // Handle SVG clicks
  const handleSvgClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as SVGElement;
    const folderId = target.getAttribute('data-folder');
    const isVault = target.getAttribute('data-vault');
    if (folderId) {
      const f = db.find((x) => x.id === folderId);
      if (f) {
        setCurFolder(f);
        setLevel(1);
        closeRP();
      }
    }
    if (isVault) {
      requirePin('Enter PIN to view private memories', () => {
        const vlt = vault();
        setCurFolder(vlt);
        setCurSub({
          id: 'vault',
          name: 'Private',
          desc: 'PIN protected',
          cells: vlt.cells || [],
          parentId: 'vault',
        });
        setLevel(2);
      });
    }
  };

  const openSub = (sf: MemorySub) => {
    setCurSub(sf);
    setLevel(2);
    closeRP();
  };

  const onCellClick = (cell: MemoryCell, sf: MemorySub, f: MemoryFolder) => {
    if (cell.pvt && !pinOk) {
      requirePin('Enter PIN to view this memory', () => {
        setCurCell({ cell, sf, f });
        setRpOpen(true);
      });
      return;
    }
    setCurCell({ cell, sf, f });
    setRpOpen(true);
  };

  const doEdit = () => {
    if (!curCell) return;
    const t = prompt('Edit memory:', curCell.cell.text);
    if (!t?.trim()) return;
    fi('Fi is updating', 1200);
    setTimeout(() => {
      setDb((prev) => {
        const next = JSON.parse(JSON.stringify(prev));
        next.forEach((folder: MemoryFolder) => {
          folder.subs?.forEach((s: MemorySub) => {
            const c = s.cells.find((x) => x.id === curCell.cell.id);
            if (c) c.text = t.trim();
          });
          if (folder.isVault) {
            const c = folder.cells?.find((x) => x.id === curCell.cell.id);
            if (c) c.text = t.trim();
          }
        });
        return next;
      });
      setCurCell((prev) => (prev ? { ...prev, cell: { ...prev.cell, text: t.trim() } } : null));
      setFiOn(false);
    }, 600);
  };

  const doDel = () => {
    if (!curCell) return;
    requireTotp('Confirm deletion with your authenticator app', () => {
      if (!confirm('Delete this memory permanently?')) return;
      fi('Removing', 900);
      setTimeout(() => {
        setDb((prev) => {
          const next = JSON.parse(JSON.stringify(prev));
          next.forEach((folder: MemoryFolder) => {
            folder.subs?.forEach((s: MemorySub) => {
              s.cells = s.cells.filter((x) => x.id !== curCell.cell.id);
            });
            if (folder.isVault)
              folder.cells = folder.cells?.filter((x) => x.id !== curCell.cell.id);
          });
          return next;
        });
        closeRP();
        setFiOn(false);
      }, 500);
    });
  };

  const getFolderIdx = (f: MemoryFolder) => nv().findIndex((x) => x.id === f.id);
  const getSubIdx = (f: MemoryFolder, sf: MemorySub) =>
    f.subs?.findIndex((s) => s.id === sf.id) ?? 0;

  // Breadcrumbs
  const crumb = () => {
    if (level === 0) return [{ l: 'Memory', cur: true }];
    if (level === 1)
      return [
        {
          l: 'Memory',
          cur: false,
          fn: () => {
            setLevel(0);
            closeRP();
          },
        },
        { l: curFolder?.name || '', cur: true },
      ];
    return [
      {
        l: 'Memory',
        cur: false,
        fn: () => {
          setLevel(0);
          closeRP();
        },
      },
      { l: curFolder?.name || '', cur: false, fn: () => setLevel(1) },
      { l: curSub?.name || '', cur: true },
    ];
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#f0f0f0',
        fontFamily: "-apple-system,'SF Pro Text',sans-serif",
        color: '#111',
        overflow: 'hidden',
      }}
    >
      {/* Topbar */}
      <div
        style={{
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 22px',
          borderBottom: '1px solid #d8d8d8',
          background: '#fafafa',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.04em', color: '#333' }}>
            Fi{' '}
            <em
              style={{
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: 9,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#bbb',
                marginLeft: 10,
              }}
            >
              Memory
            </em>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 9,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#999',
            }}
          >
            {crumb().map((c, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {i > 0 && <span style={{ color: '#c8c8c8' }}>/</span>}
                <span
                  style={{ cursor: c.fn ? 'pointer' : 'default', color: c.cur ? '#555' : '#999' }}
                  onClick={c.fn}
                >
                  {c.l}
                </span>
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            style={{
              fontSize: 9,
              padding: '4px 11px',
              border: '1px solid #d5d5d5',
              background: '#fff',
              cursor: 'pointer',
              color: pinOk ? '#222' : '#888',
              fontFamily: 'inherit',
              letterSpacing: '0.06em',
              borderRadius: 2,
              textTransform: 'uppercase',
            }}
            onClick={() => {
              if (pinOk) setPinOk(false);
              else requirePin('Enter PIN to unlock private memories', () => setPinOk(true));
            }}
          >
            ◆ {pinOk ? 'Unlocked' : 'Locked'}
          </button>
        </div>
      </div>

      {/* Nav row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 22px',
          height: 36,
          borderBottom: '1px solid #d8d8d8',
          background: '#fafafa',
          flexShrink: 0,
          gap: 6,
        }}
      >
        {level > 0 && (
          <button
            style={{
              fontSize: 9,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#aaa',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            onClick={() => {
              if (level === 1) setLevel(0);
              else setLevel(1);
              closeRP();
            }}
          >
            ← Back
          </button>
        )}
        <span
          style={{
            fontSize: 8.5,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#ccc',
          }}
        >
          {level === 0
            ? 'Click a block to explore'
            : level === 1
              ? 'Click a folder to open memory cards'
              : 'Hover a card to preview · click to open'}
        </span>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Stage */}
        <div
          style={{
            flex: 1,
            overflow: level === 0 ? 'hidden' : 'auto',
            padding: level === 0 ? 0 : 22,
            position: 'relative',
            background: level === 0 ? '#c8c8c8' : '#f0f0f0',
          }}
        >
          {/* LEVEL 0 — Die map */}
          {level === 0 && (
            <div
              dangerouslySetInnerHTML={{ __html: renderDie() }}
              style={{ position: 'absolute', inset: 0 }}
              onClick={handleSvgClick}
            />
          )}

          {/* LEVEL 1 — Folder grid */}
          {level === 1 && curFolder && !curFolder.isVault && curFolder.subs && (
            <div>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#bbb',
                  paddingBottom: 10,
                  borderBottom: '1px solid #e0e0e0',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                {curFolder.name}{' '}
                <span style={{ color: '#ccc' }}>
                  — {curFolder.subs.length} sub-folders · {allCells(curFolder)} memories
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)' }}>
                {curFolder.subs.map((sf) => (
                  <div
                    key={sf.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '10px 10px 14px',
                      cursor: 'pointer',
                      borderRadius: 2,
                      position: 'relative',
                    }}
                    onClick={() => openSub(sf)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#ebebeb')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    {/* Folder icon */}
                    <div style={{ width: 52, height: 44, position: 'relative', marginBottom: 7 }}>
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          bottom: 0,
                          width: 52,
                          height: 36,
                          background: '#e0e0e0',
                          borderRadius: '0 3px 3px 3px',
                          border: '1px solid #d0d0d0',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          width: 22,
                          height: 10,
                          background: '#e0e0e0',
                          borderRadius: '3px 3px 0 0',
                          border: '1px solid #d0d0d0',
                          borderBottom: 'none',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 11, color: '#444', letterSpacing: '0.01em' }}>
                      {sf.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LEVEL 2 — Memory cards */}
          {level === 2 && curSub && curFolder && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 18,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      fontSize: 9,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: '#aaa',
                    }}
                  >
                    {curSub.name}
                  </span>
                  <span style={{ color: '#ddd', fontSize: 9 }}>·</span>
                  <span
                    style={{
                      fontSize: 9,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: '#ccc',
                    }}
                  >
                    {curSub.cells.length} memories
                  </span>
                </div>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(10, 1fr)',
                  gap: '14px 12px',
                }}
              >
                {curSub.cells.map((cell, i) => {
                  const fIdx = getFolderIdx(curFolder);
                  const sfIdx = getSubIdx(curFolder, curSub);
                  const cardId = `${RL(fIdx >= 0 ? fIdx : 0)}${RL(sfIdx >= 0 ? sfIdx : 0)}${i}`;
                  const locked = cell.pvt && !pinOk;
                  const preview = locked ? 'Private memory' : cell.text;
                  const isSelected = curCell?.cell.id === cell.id;
                  return (
                    <div
                      key={cell.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 7,
                        cursor: 'pointer',
                        opacity: isSelected ? 0.6 : 1,
                        position: 'relative',
                      }}
                      onClick={() => onCellClick(cell, curSub, curFolder)}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.72')}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.opacity = isSelected ? '0.6' : '1')
                      }
                    >
                      <div style={{ width: 52, height: 60, position: 'relative' }}>
                        <div
                          style={{
                            position: 'absolute',
                            right: -4,
                            bottom: -4,
                            width: 46,
                            height: 54,
                            background: '#f0f0f0',
                            border: '1px solid #d8d8d8',
                            borderRadius: 2,
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            right: -2,
                            bottom: -2,
                            width: 46,
                            height: 54,
                            background: '#f5f5f5',
                            border: '1px solid #d8d8d8',
                            borderRadius: 2,
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            right: 0,
                            bottom: 0,
                            width: 46,
                            height: 54,
                            background: cell.pvt && !pinOk ? '#fafafa' : '#fff',
                            border: `1px solid ${cell.pvt && !pinOk ? '#e8e8e8' : '#ccc'}`,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <span
                            style={{
                              fontSize: 8,
                              letterSpacing: '0.04em',
                              color: cell.pvt && !pinOk ? '#ddd' : '#777',
                            }}
                          >
                            {cell.fileCode || cardId}
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          letterSpacing: '0.06em',
                          color: '#bbb',
                          textAlign: 'center',
                        }}
                      >
                        {cell.fileCode || cardId}
                      </div>
                      {/* Tooltip */}
                      <div
                        className="fc-tt"
                        style={{
                          position: 'absolute',
                          bottom: 'calc(100% + 8px)',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: 'rgba(30,30,30,.96)',
                          color: '#fff',
                          fontSize: 10,
                          padding: '8px 12px',
                          borderRadius: 3,
                          minWidth: 190,
                          maxWidth: 240,
                          width: 'max-content',
                          pointerEvents: 'none',
                          zIndex: 200,
                          letterSpacing: '0.02em',
                          lineHeight: 1.6,
                          wordBreak: 'break-word',
                          boxShadow: '0 4px 14px rgba(0,0,0,.18)',
                          opacity: 0,
                        }}
                      >
                        {!locked && (
                          <span
                            style={{
                              fontSize: 8,
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                              opacity: 0.4,
                              marginBottom: 3,
                              display: 'block',
                            }}
                          >
                            {cell.date} · {cell.time}
                          </span>
                        )}
                        {preview}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div
          style={{
            width: rpOpen ? 272 : 0,
            borderLeft: '1px solid #d8d8d8',
            background: '#fafafa',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'width 0.18s ease',
            flexShrink: 0,
          }}
        >
          {curCell && (
            <>
              <div
                style={{
                  padding: '16px 16px 12px',
                  borderBottom: '1px solid #ebebeb',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 8,
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: '#bbb',
                        marginBottom: 5,
                      }}
                    >
                      {curCell.f?.name} › {curCell.sf?.name} › {curCell.cell.fileCode || ''}
                    </div>
                  </div>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 16,
                      color: '#ccc',
                      lineHeight: 1,
                      padding: 0,
                    }}
                    onClick={closeRP}
                  >
                    ×
                  </button>
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.72, color: '#333' }}>
                  {curCell.cell.text}
                </div>
                <div style={{ marginTop: 11, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { k: 'Saved', v: `${curCell.cell.date} at ${curCell.cell.time}` },
                    { k: 'Topic', v: curCell.cell.topic || '—' },
                    { k: 'Recalled', v: `${curCell.cell.hits}× referenced` },
                    ...(curCell.cell.pvt ? [{ k: 'Access', v: 'Private' }] : []),
                  ].map((d) => (
                    <div key={d.k} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span
                        style={{
                          fontSize: 8,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: '#ccc',
                          width: 58,
                          flexShrink: 0,
                          paddingTop: 1,
                        }}
                      >
                        {d.k}
                      </span>
                      <span style={{ fontSize: 9.5, color: '#888', lineHeight: 1.4 }}>{d.v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px' }}>
                <button
                  style={{
                    fontSize: 10,
                    color: '#777',
                    cursor: 'pointer',
                    padding: '9px 0',
                    border: 'none',
                    background: 'none',
                    fontFamily: 'inherit',
                    borderBottom: '1px solid #f0f0f0',
                    textAlign: 'left',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onClick={doEdit}
                >
                  Edit memory <span style={{ color: '#ddd' }}>›</span>
                </button>
                <button
                  style={{
                    fontSize: 10,
                    color: '#ccc',
                    cursor: 'pointer',
                    padding: '9px 0',
                    border: 'none',
                    background: 'none',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onClick={doDel}
                >
                  Delete memory <span style={{ color: '#ddd' }}>›</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          height: 28,
          borderTop: '1px solid #d8d8d8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 22px',
          flexShrink: 0,
          background: '#fafafa',
        }}
      >
        <span
          style={{
            fontSize: 8.5,
            color: '#bbb',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Die map · Folder grid · Memory cards
        </span>
        <span
          style={{
            fontSize: 8.5,
            color: '#bbb',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {totalCells()} memories · {vault()?.cells?.length || 0} private
        </span>
      </div>

      {/* Fi thinking bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 34,
          left: '50%',
          transform: `translateX(-50%) translateY(${fiOn ? 0 : 6}px)`,
          background: '#222',
          color: '#fff',
          fontSize: 9.5,
          letterSpacing: '0.06em',
          padding: '6px 16px',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          zIndex: 300,
          opacity: fiOn ? 1 : 0,
          transition: 'opacity 0.18s,transform 0.18s',
          pointerEvents: 'none',
          boxShadow: '0 4px 18px rgba(0,0,0,0.15)',
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 3,
                height: 3,
                background: '#fff',
                borderRadius: '50%',
                display: 'block',
                animation: `fd 1.1s infinite ${i * 0.18}s`,
              }}
            />
          ))}
        </div>
        {fiMsg}
      </div>

      {/* TOTP Verification Modal */}
      {totpModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 800,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 32,
              width: 320,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>
              2-Factor Verification
            </div>
            <div style={{ fontSize: 13, color: '#666', textAlign: 'center' }}>
              {totpModal.label}
            </div>
            <div style={{ fontSize: 12, color: '#888', textAlign: 'center' }}>
              Open Google Authenticator or Microsoft Authenticator and enter the 6-digit code for
              Fi.
            </div>
            {totpError && <div style={{ fontSize: 13, color: '#e44' }}>{totpError}</div>}
            <input
              autoFocus
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              style={{
                padding: '12px 16px',
                borderRadius: 8,
                border: '1px solid #ddd',
                fontSize: 24,
                textAlign: 'center',
                letterSpacing: 8,
                width: '100%',
              }}
              value={totpCode}
              onChange={(e) => {
                setTotpCode(e.target.value.replaceAll(/\D/g, '').slice(0, 6));
                setTotpError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && verifyTotp()}
            />
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <button
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
                onClick={() => {
                  setTotpModal(null);
                  setTotpCode('');
                }}
              >
                Cancel
              </button>
              <button
                disabled={totpLoading || totpCode.length !== 6}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#111',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 14,
                  opacity: totpCode.length !== 6 ? 0.5 : 1,
                }}
                onClick={verifyTotp}
              >
                {totpLoading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIN Setup — first time */}
      {hasPinChecked && pinSetupMode && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(248,248,248,0.97)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            zIndex: 700,
            padding: 24,
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#111' }}>
            Protect your memories
          </div>
          <div
            style={{
              fontSize: 13,
              color: '#777',
              marginBottom: 28,
              textAlign: 'center',
              maxWidth: 300,
            }}
          >
            Set a PIN to keep your memories private. You will need it every time you open this page.
          </div>
          {setupError && (
            <div style={{ fontSize: 13, color: '#e44', marginBottom: 12 }}>{setupError}</div>
          )}
          <input
            inputMode="numeric"
            placeholder="Choose a PIN (4-6 digits)"
            style={{
              padding: '12px 16px',
              borderRadius: 8,
              border: '1px solid #ddd',
              fontSize: 18,
              textAlign: 'center',
              letterSpacing: 6,
              width: 240,
              marginBottom: 12,
            }}
            type="password"
            value={setupPin}
            onChange={(e) => {
              setSetupPin(e.target.value.replaceAll(/\D/g, '').slice(0, 6));
              setSetupError('');
            }}
          />
          <input
            inputMode="numeric"
            placeholder="Confirm PIN"
            style={{
              padding: '12px 16px',
              borderRadius: 8,
              border: '1px solid #ddd',
              fontSize: 18,
              textAlign: 'center',
              letterSpacing: 6,
              width: 240,
              marginBottom: 20,
            }}
            type="password"
            value={setupConfirm}
            onChange={(e) => {
              setSetupConfirm(e.target.value.replaceAll(/\D/g, '').slice(0, 6));
              setSetupError('');
            }}
          />
          <button
            disabled={setupLoading || setupPin.length < 4 || setupConfirm.length < 4}
            style={{
              background: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 40px',
              fontSize: 15,
              cursor: 'pointer',
              opacity: setupPin.length < 4 ? 0.5 : 1,
            }}
            onClick={handleSetupPin}
          >
            {setupLoading ? 'Setting up...' : 'Set PIN'}
          </button>
        </div>
      )}

      {/* PIN Modal */}
      {pinModal && (
        <PinModal
          label={pinModal.label}
          onCancel={() => setPinModal(null)}
          onSuccess={pinSuccess}
        />
      )}

      {/* Tooltip CSS + animations */}
      <style>{`
        .fc-tt { opacity: 0 !important; }
        *:hover > .fc-tt { opacity: 1 !important; }
        @keyframes fd { 0%,80%,100%{opacity:.25;transform:scale(.7)} 40%{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );
}
