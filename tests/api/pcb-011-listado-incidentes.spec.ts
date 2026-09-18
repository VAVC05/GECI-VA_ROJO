import { test, expect } from '@playwright/test';
import { loginExitoso } from '../helpers/auth';

const CORREO = process.env.TEST_USER_EMAIL ?? 'admin@geciva.mx';
const CONTRASENA = process.env.TEST_USER_PASSWORD ?? 'Geciva2026!';

test.describe('PCB-011 — Filtrado de incidentes por estado', () => {
  test.beforeEach(async ({ page }) => {
    await loginExitoso(page, CORREO, CONTRASENA);
  });

  test('Camino 1: filtro por estado y tipo devuelve coincidencias', async ({ page }) => {
    const res = await page.request.get('/api/incidentes?estado=ACTIVO&tipo=INCENDIO');
    expect(res.status()).toBe(200);
    const body = await res.json();

    expect(body).toHaveProperty('incidentes');
    expect(body).toHaveProperty('total');
    expect(body).toHaveProperty('page');
    expect(body).toHaveProperty('totalPages');
    expect(Array.isArray(body.incidentes)).toBe(true);

    // Todos los incidentes devueltos deben cumplir ambos filtros
    for (const inc of body.incidentes) {
      expect(inc.estado).toBe('ACTIVO');
      expect(inc.tipo).toBe('INCENDIO');
    }
  });

  test('Camino 2: filtro solo por estado devuelve coincidencias', async ({ page }) => {
    const res = await page.request.get('/api/incidentes?estado=CERRADO');
    expect(res.status()).toBe(200);
    const body = await res.json();

    expect(Array.isArray(body.incidentes)).toBe(true);

    // Todos los incidentes devueltos deben estar cerrados
    for (const inc of body.incidentes) {
      expect(inc.estado).toBe('CERRADO');
    }
  });

  test('Camino 3: sin filtros devuelve listado completo paginado', async ({ page }) => {
    const res = await page.request.get('/api/incidentes');
    expect(res.status()).toBe(200);
    const body = await res.json();

    expect(body.page).toBe(1);
    expect(body.totalPages).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(body.incidentes)).toBe(true);
    expect(body.incidentes.length).toBeLessThanOrEqual(20);

    // Verificar que el orden es por fecha descendente
    if (body.incidentes.length >= 2) {
      const fecha1 = new Date(body.incidentes[0].fechaHoraInicio).getTime();
      const fecha2 = new Date(body.incidentes[1].fechaHoraInicio).getTime();
      expect(fecha1).toBeGreaterThanOrEqual(fecha2);
    }
  });
});