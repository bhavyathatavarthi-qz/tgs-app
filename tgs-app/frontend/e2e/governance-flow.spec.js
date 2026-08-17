const { test, expect } = require('@playwright/test');

test.describe('TGS Governance Console E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept metadata call to ensure consistent dropdown options during test execution
    await page.route('/api/governance/meta', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          roles: ['Senior DevOps Engineer', 'QA Engineer', 'Developer'],
          departments: ['Infrastructure', 'Engineering', 'QA'],
          companies: ['ABC Bank', 'XYZ Solutions'],
          environments: ['Production', 'QA', 'Development'],
        }),
      });
    });

    await page.goto('/');
  });

  test('Form rendering and disabled state validation', async ({ page }) => {
    // Header check
    await expect(page.locator('text=Governance Request Console')).toBeVisible();

    // Verify analyze button disabled when fields are empty
    const analyzeButton = page.locator('button:has-text("Analyze Governance")');
    await expect(analyzeButton).toBeDisabled();

    // Fill Username
    const usernameInput = page.locator('input[placeholder="e.g. jsmith"]');
    await usernameInput.fill('jsmith');
    await expect(analyzeButton).toBeDisabled();

    // Fill Query
    const queryInput = page.locator('textarea[placeholder*="Deploy the latest build"]');
    await queryInput.fill('Deploy payments microservice to production');

    // Button should now be enabled
    await expect(analyzeButton).toBeEnabled();
  });

  test('Full governance flow execution (Mocked Backend API)', async ({ page }) => {
    // Intercept POST /api/governance
    await page.route('/api/governance', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          requestId: 'req-e2e-12345',
          evaluatedAt: new Date().toISOString(),
          company: 'ABC Bank',
          cas: { riskScore: 78, zone: 'Zone 3', zoneLabel: 'Escalate', zoneColor: 'orange' },
          decision: 'HELD',
          checks: [
            { name: 'Authorized Role', status: 'pass', detail: 'User has required permissions.' },
            { name: 'Environment', status: 'pass', detail: 'Target environment validated.' },
            { name: 'Consent', status: 'fail', detail: 'CAB approval missing for Zone 3.' },
            { name: 'Policy Compliance', status: 'warning', detail: 'Requires secondary verification.' },
            { name: 'Accountability', status: 'pass', detail: 'Audit logged successfully.' },
          ],
          policies: [
            {
              id: 'POL-013',
              title: 'Deploy Application to Production',
              category: 'Application Deployment',
              summary: 'Requires mandatory CAB sign-off before deploying to production.',
            },
          ],
          reason: 'Deployment requires mandatory CAB approval for Zone 3 production releases.',
          recommendation: 'Obtain CAB approval from the Change Governance Portal before proceeding.',
        }),
      });
    });

    // Fill form
    await page.locator('input[placeholder="e.g. jsmith"]').fill('jsmith');
    await page.locator('textarea[placeholder*="Deploy the latest build"]').fill('Deploy payment service to production');

    // Click Analyze Governance
    const analyzeButton = page.locator('button:has-text("Analyze Governance")');
    await analyzeButton.click();

    // Verify Decision Card rendered
    await expect(page.locator('text=HELD')).toBeVisible();

    // Verify Governance Checks rendered
    await expect(page.locator('text=Authorized Role')).toBeVisible();
    await expect(page.locator('text=CAB approval missing for Zone 3.')).toBeVisible();

    // Verify Policy Accordion rendered
    await expect(page.locator('text=POL-013')).toBeVisible();
    await expect(page.locator('text=Deploy Application to Production')).toBeVisible();

    // Verify Recommendation Card
    await expect(page.locator('text=Obtain CAB approval from the Change Governance Portal')).toBeVisible();
  });
});
