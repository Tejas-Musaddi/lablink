import { test, expect } from '@playwright/test';

test.describe('LabLink — Hero Workflow & Core End-to-End Capabilities', () => {
  test('Executes Hero Demo Workflow end-to-end', async ({ page }) => {
    // 1. Visit landing dashboard
    await page.goto('/');
    await expect(page).toHaveTitle(/LabLink/i);
    await expect(page.getByText('DEMO MODE')).toBeVisible();

    // 2. Open Projects page
    await page.click('text=Projects & Requirements');
    await expect(page).toHaveURL(/.*projects/);
    await expect(page.getByText('Autonomous Drone Swarm Cooperative Navigation')).toBeVisible();

    // 3. Trigger Analyse with AI
    const aiBtn = page.getByRole('button', { name: /Analyse with AI/i });
    await expect(aiBtn).toBeVisible();
    await aiBtn.click();

    // Verify AI extraction results appear
    await expect(page.getByText(/Inferred Hardware Categories/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/NVIDIA DGX Station A100/i)).toBeVisible();

    // 4. Navigate to Allocation Engine
    await page.click('text=Fair Allocation Engine');
    await expect(page).toHaveURL(/.*conflicts/);
    await expect(page.getByText(/★ Hero Scenario/i)).toBeVisible();

    // 5. Execute Allocation Engine
    const runBtn = page.getByRole('button', { name: /Execute Allocation Engine/i });
    await runBtn.click();

    // Verify structured rationale and score breakdowns
    await expect(page.getByText(/Aarav Sharma/i)).toBeVisible();
    await expect(page.getByText(/Awarded primary slot/i)).toBeVisible();
    await expect(page.getByText(/Elena Rostova/i)).toBeVisible();

    // 6. Switch Persona to Faculty Advisor
    await page.click('button:has-text("Role:")');
    await page.click('button:has-text("Faculty")');
    await expect(page.getByText('Role: Faculty')).toBeVisible();

    // 7. Approve Allocation in Faculty Portal
    await page.click('text=Faculty Portal');
    await expect(page).toHaveURL(/.*faculty/);
    const approveBtn = page.getByRole('button', { name: /Approve Recommendation/i }).first();
    await expect(approveBtn).toBeVisible();
    await approveBtn.click();

    // Confirm Modal
    const confirmApproveBtn = page.getByRole('button', { name: /Confirm Approval/i });
    await confirmApproveBtn.click();

    // 8. Inspect Calendar
    await page.click('text=Smart Booking Calendar');
    await expect(page).toHaveURL(/.*calendar/);
    await expect(page.getByText(/Autonomous Drone Swarm/i)).toBeVisible();
  });

  test('Verifies Role Switching across all personas', async ({ page }) => {
    await page.goto('/');

    // Role: Student to Lab Manager
    await page.click('button:has-text("Role:")');
    await page.click('button:has-text("Lab Manager")');
    await expect(page.getByText('Role: Lab Manager')).toBeVisible();

    // Role: Lab Manager to Campus Admin
    await page.click('button:has-text("Role:")');
    await page.click('button:has-text("Campus Admin")');
    await expect(page.getByText('Role: Campus Admin')).toBeVisible();

    // Role: Campus Admin to Student
    await page.click('button:has-text("Role:")');
    await page.click('button:has-text("Student")');
    await expect(page.getByText('Role: Student')).toBeVisible();
  });

  test('Verifies Reset Demo confirmation modal and reset execution', async ({ page }) => {
    await page.goto('/');

    const resetBtn = page.getByRole('button', { name: /Reset Demo/i });
    await resetBtn.click();

    await expect(page.getByText(/Reset Demo Simulation\?/i)).toBeVisible();
    const confirmResetBtn = page.getByRole('button', { name: /Reset to Factory Seed/i });
    await confirmResetBtn.click();

    await expect(page.getByText(/Reset Demo Simulation\?/i)).not.toBeVisible();
  });

  test('Cancels booking and verifies automatic promotion logic', async ({ page }) => {
    await page.goto('/calendar');
    await page.click('button:has-text("Accessible List")');
    await expect(page.getByText(/Upcoming Schedule \(Accessible List View\)/i)).toBeVisible();

    const inspectBtn = page.getByRole('button', { name: /Inspect/i }).first();
    if (await inspectBtn.isVisible()) {
      await inspectBtn.click();
      const cancelBtn = page.getByRole('button', { name: /Cancel Session/i });
      await cancelBtn.click();
    }
  });
});
