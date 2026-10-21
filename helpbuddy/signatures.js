/* HelpBuddy personal signature profile. Stores a reference, never a raw secret/key. */
(function (global) {
  'use strict';
  const KEY = 'om-helpbuddy-signature-v1';
  function read() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (_) { return {}; } }
  function save(userId, signatureRef, displayName) { if (!userId || !signatureRef) throw new Error('userId and signatureRef are required'); const all = read(); all[userId] = { userId, signatureRef, displayName: displayName || userId, updatedAt: new Date().toISOString() }; localStorage.setItem(KEY, JSON.stringify(all)); return all[userId]; }
  function get(userId) { return read()[userId] || null; }
  global.HelpBuddySignatures = Object.freeze({ save, get });
})(window);
