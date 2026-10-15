import { test, expect } from '@playwright/test';

const isMobile=(project: string)=>project==='mobile-chromium';

test('full homepage, noindex and responsive layout', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toContainText('THE SURFACE');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  expect(response?.headers()['x-robots-tag']).toContain('noindex');
  await expect(page.locator('#services')).toBeVisible();
  await expect(page.locator('#materials')).toBeVisible();
  await expect(page.locator('#portfolio')).toBeVisible();
  await expect(page.locator('#method')).toBeVisible();
  await expect(page.locator('#inquiry')).toBeVisible();
  const size = await page.evaluate(() => ({ viewport: window.innerWidth, width: document.documentElement.scrollWidth }));
  expect(size.width, 'Horizontal overflow should not affect the page viewport').toBeLessThanOrEqual(size.viewport + 2);
  if (isMobile(info.project.name)) {
    const nav=page.locator('#mainNav');
    await expect(nav).toBeHidden();
    await page.locator('.menu-toggle').click();
    await expect(nav).toBeVisible();
    await nav.getByRole('link',{name:'Solutions'}).click();
    await expect(nav).toBeHidden();
    const cta = await page.locator('.hero-cta .button-accent').boundingBox();
    expect(cta?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
  await page.screenshot({ path:'test-results/'+info.project.name+'-homepage.png', fullPage:true, animations:'disabled' });
  expect(errors).toEqual([]);
});

test('four generator controls, material tabs, gallery filtering', async ({ page }) => {
  await page.goto('/', { waitUntil:'domcontentloaded' });
  await page.locator('.studio-tab').click();
  await expect(page.locator('#studioPanel')).toHaveClass(/open/);
  await page.locator('#brandName').fill('APEX TEST');
  await expect(page.locator('.wordstack b')).toHaveText('APEX TEST');
  await page.getByRole('button',{name:'Architectural Blue'}).click();
  const accent=await page.locator('.prime-app').evaluate(el=>getComputedStyle(el).getPropertyValue('--accent').trim());
  expect(accent).toBe('#377fbd');
  await page.locator('#copyPreset').selectOption('commercial');
  await expect(page.locator('#heroTitle')).toContainText('PERFORMANCE');
  await page.locator('#imagePreset').selectOption('interior');
  await expect(page.locator('.hero-photo')).toHaveCSS('background-image', /IMG_5783-min/);
  await page.getByRole('button',{name:'Close design studio'}).click();
  await expect(page.locator('#studioPanel')).not.toHaveClass(/open/);
  await page.getByRole('button',{name:/METALLIC EFFECT/}).click();
  await expect(page.locator('.finish-label strong')).toHaveText('METALLIC EFFECT');
  await page.getByRole('button',{name:'GARAGES',exact:true}).click();
  await expect(page.locator('.portfolio-item:visible')).toHaveCount(2);
});

test('synthetic inquiry stays in browser and has no POST', async ({ page }) => {
  const mutatingRequests:string[]=[];
  page.on('request',r=>{if (['POST','PATCH','PUT','DELETE'].includes(r.method()))mutatingRequests.push(r.method()+' '+r.url())});
  await page.goto('/', {waitUntil:'domcontentloaded'});
  await page.locator('select[name="category"]').selectOption('Residential garage');
  await page.locator('input[name="area"]').fill('600');
  await page.locator('select[name="condition"]').selectOption('Bare concrete');
  await page.locator('textarea[name="notes"]').fill('Synthetic test only');
  await page.getByRole('button',{name:/REVIEW MY PROJECT BRIEF/}).click();
  await expect(page.getByRole('status')).toContainText('LOCAL DEMO ONLY');
  await expect(page.getByRole('status')).toContainText('600 sq ft');
  expect(mutatingRequests).toEqual([]);
});
