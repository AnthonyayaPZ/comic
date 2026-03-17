let idCounter = 0;

export const createId = () => {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  idCounter += 1;
  return `id-${Date.now().toString(36)}-${idCounter.toString(36)}`;
};
