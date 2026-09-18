import { test, expect } from '@playwright/test';
import { loginExitoso } from '../helpers/auth';

const CORREO = process.env.TEST_USER_EMAIL ?? 'admin@geciva.mx';
const CONTRASENA = process.env.TEST_USER_PASSWORD ?? 'Geciva2026!';

test.describe('PCB-001 — Registro completo de incidente (POST)', () => {
  test('Camino 1: sin sesión redirige al login', async ({ playwright }) => {
    const requestAislado = await playwright.request.newContext({
      storageState: { cookies: [], origins: [] },
      maxRedirects: 0,
    });

    const res = await requestAislado.post(
      'http://localhost:3000/api/incidentes',
      {
        data: {
          nombre: 'Incendio de prueba',
          tipo: 'INCENDIO',
          lugar: 'Av. Tecnológico 100',
          fechaHoraInicio: new Date().toISOString(),
        },
        failOnStatusCode: false,
      }
    );

    // El middleware redirige al login cuando no hay sesión
    expect([302, 307]).toContain(res.status());
    const location = res.headers()['location'] ?? '';
    expect(location).toContain('/api/auth/signin');
    expect(location).toContain('callbackUrl');

    await requestAislado.dispose();
  });

  test('Camino 2: rol no autorizado responde sin permisos', async ({ page }) => {
    await loginExitoso(page, 'operativo@geciva.mx', 'Geciva2026!');

    const res = await page.request.post('/api/incidentes', {
      data: {
        nombre: 'Incendio de prueba',
        tipo: 'INCENDIO',
        lugar: 'Av. Tecnológico 100',
        fechaHoraInicio: new Date().toISOString(),
      },
    });

    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('No tienes permisos para crear incidentes');
  });

  test('Camino 3: datos inválidos responde error de validación', async ({ page }) => {
    await loginExitoso(page, CORREO, CONTRASENA);

    const res = await page.request.post('/api/incidentes', {
      data: {
        nombre: 'AB',
        tipo: '',
        lugar: '',
        fechaHoraInicio: 'fecha-invalida',
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Datos inválidos');
    expect(Array.isArray(body.details)).toBe(true);
  });

  test('Camino 4 y 5: creación exitosa con folio consecutivo', async ({ page }) => {
    await loginExitoso(page, CORREO, CONTRASENA);

    const res1 = await page.request.post('/api/incidentes', {
      data: {
        nombre: 'Incendio de prueba A',
        tipo: 'INCENDIO',
        lugar: 'Av. Tecnológico 100',
        fechaHoraInicio: new Date().toISOString(),
      },
    });
    expect(res1.status()).toBe(201);
    const inc1 = await res1.json();
    expect(inc1.folio).toMatch(/^GECI-\d{4}-\d{5}$/);
    expect(inc1.estado).toBe('ACTIVO');
    expect(inc1.idIncidente).toBeDefined();

    const res2 = await page.request.post('/api/incidentes', {
      data: {
        nombre: 'Incendio de prueba B',
        tipo: 'INCENDIO',
        lugar: 'Av. Tecnológico 200',
        fechaHoraInicio: new Date().toISOString(),
      },
    });
    expect(res2.status()).toBe(201);
    const inc2 = await res2.json();

    const anio = new Date().getFullYear();
    const n1 = parseInt(inc1.folio.split('-')[2], 10);
    const n2 = parseInt(inc2.folio.split('-')[2], 10);
    expect(inc2.folio).toBe(`GECI-${anio}-${String(n1 + 1).padStart(5, '0')}`);
    expect(n2).toBe(n1 + 1);
  });
});