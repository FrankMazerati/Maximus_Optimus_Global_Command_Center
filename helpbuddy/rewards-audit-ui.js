/* HelpBuddy live progress, audit ledger, and same-level peer handoff UI.
 * Requires an authenticated Supabase client exposed as window.supabaseClient.
 * If the client is absent, this module deliberately shows a disconnected state
 * rather than inventing stars, audit events, or successful ticket transfers.
 */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const safe = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const clientReady = () => !!(window.supabaseClient && typeof window.supabaseClient.from === 'function');
  const adapter = () => {
    if (!clientReady()) throw new Error('Supabase authentication is not connected on this page. No live data was loaded and no action was taken.');
    return window.HelpBuddySupabase.create(window.supabaseClient);
  };
  const setStatus = (text) => {
    const el = $('helpbuddyBackendStatus');
    if (el) el.textContent = text;
  };
  const renderDisconnected = () => {
    setStatus('Backend not connected · live identity, stars, audit, and ticket actions unavailable');
    const progress = $('helpbuddyProgressDetails');
    if (progress) progress.textContent = 'Sign in through the connected Command Center to load verified stars and level.';
    const audit = $('helpbuddyAuditList');
    if (audit) audit.textContent = 'No live audit data loaded. This is not a claim that the audit ledger is empty.';
  };
  async function refresh() {
    try {
      const api = adapter();
      const p = await api.getMyProgress();
      const heading = document.querySelector('.top h1');
      if (heading) heading.textContent = 'Welcome back, ' + (p.profile.display_name || 'team member');
      const summary = document.querySelector('.top .muted');
      if (summary) summary.textContent = (p.profile.job_title || 'Employee') + ' · Level ' + p.level + ' · ' + p.totalStars + ' verified stars';
      const progress = $('helpbuddyProgressDetails');
      if (progress) progress.innerHTML = '<strong>' + p.totalStars + ' stars · Level ' + p.level + '</strong><div class="muted">' + p.starsToNextLevel + ' more star(s) to the next level. Level 1 is the starting level; each 5 earned stars advances one level.</div>';
      const eventHost = $('helpbuddyStarEvents');
      if (eventHost) {
        eventHost.replaceChildren();
        if (!p.events.length) eventHost.textContent = 'No verified star awards yet. Stars are earned from recorded completed work and qualifying approvals.';
        p.events.forEach(e => {
          const row = document.createElement('div');
          row.className = 'item';
          row.innerHTML = '<strong>⭐ +' + Number(e.stars_awarded) + ' · ' + safe(e.event_code.replaceAll('_',' ')) + '</strong><small>' + safe(new Date(e.occurred_at).toLocaleString()) + ' · ' + safe(e.source_type) + '</small>';
          eventHost.appendChild(row);
        });
      }
      setStatus('Connected · verified progress loaded from Supabase');
    } catch (error) {
      setStatus(error.message || 'Unable to load verified progress.');
    }
    try {
      const api = adapter();
      const events = await api.getMyAuditEvents(50);
      const host = $('helpbuddyAuditList');
      if (host) {
        host.replaceChildren();
        if (!events.length) host.textContent = 'No audit events were returned for this signed-in user.';
        events.forEach(e => {
          const row = document.createElement('div');
          row.className = 'item';
          row.innerHTML = '<strong>' + safe(e.action) + '</strong><small>' + safe(e.target_type) + ' · ' + safe(e.target_id) + ' · ' + safe(new Date(e.occurred_at).toLocaleString()) + '</small><small>' + safe(e.outcome) + ' · ' + safe(e.source) + '</small>';
          host.appendChild(row);
        });
      }
    } catch (error) {
      const host = $('helpbuddyAuditList');
      if (host) host.textContent = error.message || 'Audit events could not be loaded.';
    }
  }
  window.transfer = async function (ticketLabel) {
    let peers;
    try { peers = await adapter().listPeerHandoffTargets(); }
    catch (error) {
      if ($('answer')) $('answer').textContent = error.message || 'Peer handoff unavailable. No ticket was changed.';
      return;
    }
    if (!peers.length) {
      if ($('answer')) $('answer').textContent = 'No active same-level peer is available in your organization. No ticket was changed.';
      return;
    }
    const options = peers.map(p => '<option value="' + safe(p.id) + '">' + safe(p.displayName || p.jobTitle || 'Support peer') + ' — ' + safe(p.jobTitle || p.roleCode) + '</option>').join('');
    const html = '<p class="muted">This creates an audited same-level handoff. The ticket number and history remain unchanged. No manager escalation is created.</p>' +
      '<div class="kv"><b>Ticket</b><span>' + safe(ticketLabel) + '</span></div>' +
      '<div class="kv"><b>Same-level recipient</b><select id="peerTarget" style="width:100%;background:#07131b;color:#fff;border:1px solid #244552;padding:8px;border-radius:8px">' + options + '</select></div>' +
      '<div class="kv"><b>Reason</b><textarea id="peerReason" rows="3" placeholder="Why is this ticket being handed to a peer?" style="width:100%;background:#07131b;color:#fff;border:1px solid #244552;padding:8px;border-radius:8px"></textarea></div>' +
      '<div class="kv"><b>Carry-over notes</b><textarea id="peerNotes" rows="3" placeholder="Steps completed, pending equipment, next action, and shift notes" style="width:100%;background:#07131b;color:#fff;border:1px solid #244552;padding:8px;border-radius:8px"></textarea></div>' +
      '<div class="actions"><button class="btn primary" id="confirmPeerHandoff">Record Peer Handoff</button><button class="btn" onclick="closeModal()">Cancel</button></div>';
    openModal('HelpBuddy · Same-Level Peer Handoff', html);
    const button = $('confirmPeerHandoff');
    if (button) button.onclick = async function () {
      button.disabled = true;
      try {
        const api = adapter();
        await api.handoffTicketByNumber(ticketLabel, $('peerTarget').value, $('peerReason').value, $('peerNotes').value);
        closeModal();
        if ($('answer')) $('answer').textContent = ticketLabel + ' was handed off. The ticket history and HelpBuddy audit ledger were recorded.';
        await refresh();
      } catch (error) {
        const body = $('modalBody');
        const msg = document.createElement('p');
        msg.className = 'danger';
        msg.textContent = (error.message || 'Handoff failed.') + ' No success is reported unless the backend confirms it.';
        body.appendChild(msg);
        button.disabled = false;
      }
    };
  };
  document.addEventListener('DOMContentLoaded', function () {
    if (!clientReady()) { renderDisconnected(); return; }
    refresh();
  });
  window.HelpBuddyRewardsAudit = Object.freeze({ refresh });
})();