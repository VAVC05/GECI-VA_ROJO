import { APIRequestContext, Page, expect } from '@playwright/test';

export async function llenarYEnviarLogin(
  page: Page,
  correo: string,
  contrasena: string
) {
  await page.goto('/login');
  if (correo) {
    await page.locator('#correo').fill(correo);
  }
  if (contrasena) {
    await page.locator('#contrasena').fill(contrasena);
  }
  await page.getByRole('button', { name: /Ingresar|Entrando/ }).click();
}

export async function intentarLoginPorAPI(
  request: APIRequestContext,
  correo: string,
  contrasena: string
): Promise<{ tieneSession: boolean; respuesta: string }> {
  const csrfRes = await request.get('/api/auth/csrf');
  const csrfBody = await csrfRes.json();
  const csrfToken = csrfBody.csrfToken;

  const loginRes = await request.post('/api/auth/callback/credentials', {
    form: {
      csrfToken,
      correo,
      contrasena,
      callbackUrl: '/dashboard',
      json: 'true',
    },
    failOnStatusCode: false,
  });

  const body = await loginRes.text();
  const cookies = await request.storageState();
  const tieneCookie = cookies.cookies.some(
    (c) => c.name === 'next-auth.session-token' || c.name === '__Secure-next-auth.session-token'
  );

  console.log('[Debug API] Status:', loginRes.status());
  console.log('[Debug API] Body:', body);
  console.log('[Debug API] Cookies presentes:', cookies.cookies.map((c) => c.name).join(', '));

  return { tieneSession: tieneCookie, respuesta: body };
}

export async function loginExitoso(page: Page, correo: string, contrasena: string) {
  await llenarYEnviarLogin(page, correo, contrasena);
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
}
