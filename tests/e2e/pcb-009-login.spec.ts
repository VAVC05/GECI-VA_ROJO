import { test, expect } from '@playwright/test';
import { llenarYEnviarLogin, intentarLoginPorAPI } from '../helpers/auth';

const CORREO_VALIDO = process.env.TEST_USER_EMAIL ?? 'admin@geciva.mx';
const CONTRASENA_VALIDA = process.env.TEST_USER_PASSWORD ?? 'Geciva2026!';

test.describe('PCB-009 — Inicio de sesión', () => {
  test('Camino 1: correo vacío retorna null en authorize', async ({ request }) => {
    const { tieneSession } = await intentarLoginPorAPI(request, '', 'cualquier');
    expect(tieneSession).toBe(false);
  });

  test('Camino 2: contraseña vacía retorna null en authorize', async ({ request }) => {
    const { tieneSession } = await intentarLoginPorAPI(request, CORREO_VALIDO, '');
    expect(tieneSession).toBe(false);
  });

  test('Camino 3: usuario inexistente muestra mensaje de error', async ({ page }) => {
    await llenarYEnviarLogin(page, 'no-existe@test.local', 'cualquier123');
    await expect(
      page.getByText('Correo o contraseña incorrectos.')
    ).toBeVisible({ timeout: 10_000 });
  });

  test('Camino 4: usuario inactivo muestra mensaje de error', async ({ page }) => {
    await llenarYEnviarLogin(page, 'inactivo@test.local', 'Cualquier123!');
    await expect(
      page.getByText('Correo o contraseña incorrectos.')
    ).toBeVisible({ timeout: 10_000 });
  });

  test('Camino 5: contraseña incorrecta muestra mensaje de error', async ({ page }) => {
    await llenarYEnviarLogin(page, CORREO_VALIDO, 'contrasenaIncorrecta999');
    await expect(
      page.getByText('Correo o contraseña incorrectos.')
    ).toBeVisible({ timeout: 10_000 });
  });

  test('Camino 6: credenciales válidas redirigen al dashboard', async ({ page }) => {
    await llenarYEnviarLogin(page, CORREO_VALIDO, CONTRASENA_VALIDA);
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });
});