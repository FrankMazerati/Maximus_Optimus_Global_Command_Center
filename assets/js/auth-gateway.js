(function (global) {
  function el(tag, attrs, text) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([key, value]) => node.setAttribute(key, value));
    if (text) node.textContent = text;
    return node;
  }
  async function loadIdentity(client, user) {
    const p = await client.from('profiles')
      .select('id,organization_id,tenant_id,employee_global_id,company_global_id,display_name,work_email,job_title,member_status')
      .eq('id', user.id).maybeSingle();
    if (p.error) throw p.error;
    if (!p.data) throw new Error('Your account is signed in but has no provisioned Command Center profile. Contact an administrator.');
    const r = await client.from('profile_roles')
      .select('role_id,organization_id,tenant_id,is_active,expires_at,roles(role_key,name)')
      .eq('profile_id', user.id).eq('is_active', true);
    if (r.error) throw r.error;
    const roles = (r.data || []).filter(x => !x.expires_at || Date.parse(x.expires_at) > Date.now()).map(x => ({
      id:x.role_id, key:x.roles && x.roles.role_key || '', name:x.roles && x.roles.name || '',
      organizationId:x.organization_id, tenantId:x.tenant_id
    }));
    return { userId:user.id, email:user.email || p.data.work_email || '', profile:p.data, roles };
  }
  function banner(message) {
    if (document.getElementById('maximus-auth-status-banner')) return;
    const box = el('div', {id:'maximus-auth-status-banner', role:'status'});
    box.textContent = message;
    box.style.cssText = 'position:fixed;z-index:9000;bottom:12px;left:12px;right:12px;padding:10px 14px;border:1px solid #d6b45b;border-radius:10px;background:#fff7df;color:#684c14;font:12px system-ui;box-shadow:0 8px 30px #0003';
    document.body.appendChild(box);
  }
  function mount() {
    const client = global.MaximusSupabase && global.MaximusSupabase.init();
    if (!client) {
      banner('Demo preview only — live authentication is not configured. No account or backend action is being simulated as successful.');
      return;
    }
    const overlay = el('div', {id:'maximus-auth-overlay'});
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:18px;background:#061018eF;font:14px system-ui';
    const card = el('section', {});
    card.style.cssText = 'width:min(440px,100%);padding:26px;border:1px solid #4ba9c5;border-radius:18px;background:linear-gradient(145deg,#f8fdff,#eaf8fc);color:#173746;box-shadow:0 24px 90px #0008';
    const brand = el('div', {}, 'IS  |  INTELLISTACK SYSTEMS');
    brand.style.cssText = 'font-weight:900;letter-spacing:.12em;color:#1472a1;font-size:12px;margin-bottom:18px';
    const heading = el('h2', {}, 'Maximus Optimus Command Center');
    heading.style.cssText = 'margin:0 0 6px;font-size:21px';
    const intro = el('p', {}, 'Sign in with your organization-issued account. Your role and access scope are loaded from the server-managed profile.');
    intro.style.cssText = 'font-size:12px;line-height:1.5;color:#56717e';
    const form = el('form', {});
    const email = el('input', {type:'email', name:'email', required:'required', autocomplete:'username', placeholder:'Work email'});
    const password = el('input', {type:'password', name:'password', required:'required', autocomplete:'current-password', placeholder:'Password'});
    [email,password].forEach(input => input.style.cssText = 'display:block;box-sizing:border-box;width:100%;margin:10px 0;padding:12px;border:1px solid #b7d3de;border-radius:9px;background:white;color:#173746');
    const submit = el('button', {type:'submit'}, 'Sign in securely');
    submit.style.cssText = 'width:100%;margin-top:8px;padding:12px;border:0;border-radius:9px;background:linear-gradient(90deg,#24c4ed,#5b85ff);color:#062333;font-weight:900';
    const status = el('p', {role:'status','aria-live':'polite'}, '');
    status.style.cssText = 'min-height:18px;font-size:12px;color:#315d6f';
    form.append(email,password,submit,status);
    form.addEventListener('submit', async event => {
      event.preventDefault(); submit.disabled = true; status.textContent = 'Authenticating…';
      try {
        const result = await client.auth.signInWithPassword({email:email.value.trim(),password:password.value});
        if (result.error) throw result.error;
        const identity = await loadIdentity(client, result.data.user);
        global.MaximusIdentity = Object.freeze(identity);
        overlay.remove();
        global.dispatchEvent(new CustomEvent('maximus:authenticated',{detail:identity}));
      } catch (error) {
        status.textContent = error && error.message ? error.message : 'Sign-in failed. Check the account or contact an administrator.';
        try { await client.auth.signOut(); } catch (_) {}
      } finally { submit.disabled = false; }
    });
    card.append(brand,heading,intro,form);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
  }
  async function signOut() {
    const client = global.MaximusSupabase && global.MaximusSupabase.getClient();
    if (!client) return;
    const {error} = await client.auth.signOut();
    if (error) throw error;
    global.MaximusIdentity = null;
    global.dispatchEvent(new CustomEvent('maximus:signout'));
    location.reload();
  }
  global.MaximusAuth = Object.freeze({mount, signOut, loadIdentity});
  document.addEventListener('DOMContentLoaded', mount, {once:true});
})(window);
