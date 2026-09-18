import { test, expect } from '@playwright/test';
import { loginExitoso } from '../helpers/auth';

const CORREO = process.env.TEST_USER_EMAIL ?? 'admin@geciva.mx';
const CONTRASENA = process.env.TEST_USER_PASSWORD ?? 'Geciva2026!';

test.describe('PCB-015 — Cálculo de estadísticas', () => {
  test.beforeEach(async ({ page }) => {
    await loginExitoso(page, CORREO, CONTRASENA);
  });

  test('Camino 1: respuesta completa con todos los campos y promedio numérico', async ({ page }) => {
    const res = await page.request.get('/api/estadisticas');
    expect(res.status()).toBe(200);
    const body = await res.json();

    // Verificar presencia y tipo de cada campo de la respuesta
    expect(typeof body.totalIncidentes).toBe('number');
    expect(typeof body.totalVictimas).toBe('number');
    expect(typeof body.totalRecursosUtilizados).toBe('number');
    expect(typeof body.promedioHorasAtencion).toBe('number');

    // Verificar las agrupaciones
    expect(Array.isArray(body.incidentesPorTipo)).toBe(true);
    expect(Array.isArray(body.incidentesPorEstado)).toBe(true);
    expect(Array.isArray(body.incidentesPorMes)).toBe(true);

    // Verificar que las agrupaciones por tipo y estado tengan el campo _count
    for (const item of body.incidentesPorTipo) {
      expect(item.tipo).toBeDefined();
      expect(typeof item._count).toBe('number');
    }
    for (const item of body.incidentesPorEstado) {
      expect(item.estado).toBeDefined();
      expect(typeof item._count).toBe('number');
    }

    // Verificar que el promedio no sea NaN ni un valor negativo
    expect(Number.isNaN(body.promedioHorasAtencion)).toBe(false);
    expect(body.promedioHorasAtencion).toBeGreaterThanOrEqual(0);
  });

  test('Camino 2: promedio calculado como número decimal válido cuando hay datos', async ({ page }) => {
    // Verificar primero cuántos incidentes cerrados existen
    const incRes = await page.request.get('/api/incidentes?estado=CERRADO&limit=1');
    expect(incRes.status()).toBe(200);
    const incBody = await incRes.json();

    const res = await page.request.get('/api/estadisticas');
    expect(res.status()).toBe(200);
    const stats = await res.json();

    // El promedio siempre debe ser un número válido, ya sea positivo o cero
    expect(typeof stats.promedioHorasAtencion).toBe('number');
    expect(Number.isFinite(stats.promedioHorasAtencion)).toBe(true);
    expect(Number.isNaN(stats.promedioHorasAtencion)).toBe(false);

    // Si existen incidentes cerrados, el promedio debería ser mayor a 0
    // Si no existen, debe ser exactamente 0 (rama del ternario)
    if (incBody.total > 0) {
      expect(stats.promedioHorasAtencion).toBeGreaterThan(0);
    } else {
      expect(stats.promedioHorasAtencion).toBe(0);
    }
  });
});