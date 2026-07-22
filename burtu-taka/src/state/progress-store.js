// Progresa saglabāšana (localStorage). Struktūra ir sadalīta pa "režīmiem"
// (šobrīd tikai 'trace' - vilkšanas mehānika), lai nākotnes režīmi
// (word-gap, math-gap - skat. src/modes/mode-registry.js) var izmantot to
// pašu score/progresa API, nesajaucot datus.

const STORAGE_KEY = 'burtu-taka:progress:v1';

function emptyState() {
  return {
    version: 1,
    totalScore: 0,
    lastMode: 'trace',
    lastScript: 'print',
    lastSetKey: 'letters',
    modes: {},
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1) return emptyState();
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

function pathKey(mode, script, setKey) {
  return `${mode}:${script}:${setKey}`;
}

function ensureSet(state, mode, script, setKey) {
  const key = pathKey(mode, script, setKey);
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

  getSetProgress(mode, script, setKey) {
    const s = ensureSet(this.state, mode, script, setKey);
    return { completedIds: s.completedIds.slice(), lastId: s.lastId };
  }

  markCompleted(mode, script, setKey, id) {
    const s = ensureSet(this.state, mode, script, setKey);
    if (!s.completedIds.includes(id)) s.completedIds.push(id);
    save(this.state);
  }

  setLastId(mode, script, setKey, id) {
    const s = ensureSet(this.state, mode, script, setKey);
    s.lastId = id;
    this.state.lastMode = mode;
    this.state.lastScript = script;
    this.state.lastSetKey = setKey;
    save(this.state);
  }

  getLastContext() {
    return { mode: this.state.lastMode, script: this.state.lastScript, setKey: this.state.lastSetKey };
  }

  isCompleted(mode, script, setKey, id) {
    const s = ensureSet(this.state, mode, script, setKey);
    return s.completedIds.includes(id);
  }
}

export const progressStore = new ProgressStore();
