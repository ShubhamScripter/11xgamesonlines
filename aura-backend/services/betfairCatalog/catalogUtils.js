export function isProviderDActive() {
  const provider = (process.env.API_PROVIDER || 'providerA').toLowerCase();
  return provider === 'providerd' || provider === 'provider_d';
}
