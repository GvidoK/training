// Progresa saglabāšana (localStorage). Struktūra ir sadalīta pa "režīmiem"
// (šobrīd tikai 'trace' - vilkšanas mehānika), lai nākotnes režīmi
// (word-gap, math-gap - skat. src/modes/mode-registry.js) var izmantot to
// pašu score/progresa API, nesajaucot datus.

const STORAGE_KEY = 'burtu-taka:progress:v2';

function emptyState() {
  return {
    version: 2,
    totalScore: 0,
    lastMode: 'trace',
    lastSetKey: 'letters',
    modes: {},
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 2) return emptyState();
    return parsed;
  } catch {
    return emptyState();
  }
}

function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage nav pieejams (privātais režīms u.tml.) - klusi ignorē
  }
}

function pathKey(mode, setKey) {
  return `${mode}:${setKey}`;
}

function ensureSet(state, mode, setKey) {
  const key = pathKey(mode, setKey);
  if (!state.modes[key]) {
    state.modes[key] = { completedIds: [], lastId: null };
  }
  return state.modes[key];
}

export class ProgressStore {
  constructor() {
    this.state = load();
  }

  getScore() { return this.state.totalScore; }

  addScore(n) {
    this.state.totalScore += n;
    save(this.state);
    return this.state.totalScore;
  }

  getSetProgress(mode, setKey) {
    const s = ensureSet(this.state, mode, setKey);
    return { completedIds: s.completedIds.slice(), lastId: s.lastId };
  }

  markCompleted(mode, setKey, id) {
    const s = ensureSet(this.state, mode, setKey);
    if (!s.completedIds.includes(id)) s.completedIds.push(id);
    save(this.state);
  }

  setLastId(mode, setKey, id) {
    const s = ensureSet(this.state, mode, setKey);
    s.lastId = id;
    this.state.lastMode = mode;
    this.state.lastSetKey = setKey;
    save(this.state);
  }

  getLastContext() {
    return { mode: this.state.lastMode, setKey: this.state.lastSetKey };
  }

  isCompleted(mode, setKey, id) {
    const s = ensureSet(this.state, mode, setKey);
    return s.completedIds.includes(id);
  }
}

export const progressStore = new ProgressStore();
