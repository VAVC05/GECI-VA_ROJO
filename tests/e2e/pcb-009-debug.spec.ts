import { test, expect } from '@playwright/test';
import { intentarLoginPorAPI } from '../helpers/auth';

const CORREO_VALIDO = process.env.TEST_USER_EMAIL ?? 'admin@geciva.mx';
const CONTRASENA_VALIDA = process.env.TEST_USER_PASSWORD ?? 'Geciva2026!';

test('Debug: login por API con credenciales válidas', async ({ request }) => {
  const { tieneSession } = await intentarLoginPorAPI(
    request,
    CORREO_VALIDO,
    CONTRASENA_VALIDA
  );
  console.log('¿Tiene cookie de sesión?', tieneSession);
  expect(tieneSession).toBe(true);
});