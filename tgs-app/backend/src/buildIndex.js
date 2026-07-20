/* Run with: npm run build:index
 * Builds and persists the HNSWLib vector store for every company in the
 * registry. Useful to run once so `REBUILD_INDEX_ON_START=false` can be used
 * for fast subsequent server boots.
 */
const config = require('./config');
const { buildIndexForCompany } = require('./vectorStoreManager');

(async () => {
  const names = Object.keys(config.companyRegistry);
  for (const name of names) {
    await buildIndexForCompany(name);
  }
  console.log('[buildIndex] Done.');
  process.exit(0);
})().catch((err) => {
  console.error('[buildIndex] Failed:', err);
  process.exit(1);
});
