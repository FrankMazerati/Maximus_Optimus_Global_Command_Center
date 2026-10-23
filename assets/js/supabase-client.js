/* Supabase client bootstrap.
 * Public project URL and anon/publishable key belong in deployment configuration.
 * Never put a service-role/secret key in this file or in browser configuration.
 */
(function (global) {
  const config = global.MAXIMUS_CONFIG || {};
  const state = { client: null, configured: false, error: null };

  function init() {
    if (state.client) return state.client;
    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      state.error = 'Supabase is not configured. Set MAXIMUS_CONFIG.supabaseUrl and MAXIMUS_CONFIG.supabaseAnonKey in the deployment environment.';
      return null;
    }
    if (!global.supabase || typeof global.supabase.createClient !== 'function') {
      state.error = 'Supabase JavaScript SDK did not load.';
      return null;
    }
    try {
      state.client = global.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      state.configured = true;
      state.error = null;
      return state.client;
    } catch (error) {
      state.error = error && error.message ? error.message : 'Could not initialize Supabase.';
      return null;
    }
  }

  global.MaximusSupabase = Object.freeze({
    init,
    getClient: () => state.client,
    isConfigured: () => state.configured,
    getError: () => state.error,
    getConfig: () => ({ supabaseUrl: config.supabaseUrl || '', configured: Boolean(config.supabaseUrl && config.supabaseAnonKey) })
  });
})(window);
