import { test, expect } from '@playwright/test';
import { loginExitoso } from '../helpers/auth';

const CORREO = process.env.TEST_USER_EMAIL ?? 'admin@geciva.mx';
const CONTRASENA = process.env.TEST_USER_PASSWORD ?? 'Geciva2026!';

test.describe('PCB-012 — Listado de recursos con estado', () => {
  test.beforeEach(async ({ page }) => {
    await loginExitoso(page, CORREO, CONTRASENA);
  });

  test('Camino 1: filtros estado, clase y tipo combinados', async ({ page }) => {
    const res = await page.request.get(
      '/api/recursos?estado=DISPONIBLE&clase=VEHICULO&tipo=AMBULANCIA'
    );
    expect(res.status()).toBe(200);
    const body = await res.json();

    expect(Array.isArray(body.recursos)).toBe(true);
    expect(body).toHaveProperty('total');
    expect(body).toHaveProperty('page');
    expect(body).toHaveProperty('totalPages');

    // Todos los recursos devueltos deben cumplir los tres filtros
    for (const recurso of body.recursos) {
      expect(recurso.estado).toBe('DISPONIBLE');
      expect(recurso.clase).toBe('VEHICULO');
      expect(recurso.tipo).toBe('AMBULANCIA');
    }
  });

  test('Camino 2: filtros estado y clase sin tipo', async ({ page }) => {
    const res = await page.request.get('/api/recursos?estado=ASIGNADO&clase=VEHICULO');
    expect(res.status()).toBe(200);
    const body = await res.json();

    expect(Array.isArray(body.recursos)).toBe(true);

    // Todos los recursos devueltos deben cumplir estado y clase
    for (const recurso of body.recursos) {
      expect(recurso.estado).toBe('ASIGNADO');
      expect(recurso.clase).toBe('VEHICULO');
    }
  });

  test('Camino 3: filtro únicamente por estado', async ({ page }) => {
    const res = await page.request.get('/api/recursos?estado=DISPONIBLE');
    expect(res.status()).toBe(200);
    const body = await res.json();

    expect(Array.isArray(body.recursos)).toBe(true);

    for (const recurso of body.recursos) {
      expect(recurso.estado).toBe('DISPONIBLE');
    }
  });

  test('Camino 4: sin filtros devuelve todos los recursos con asignación activa', async ({ page }) => {
    const res = await page.request.get('/api/recursos');
    expect(res.status()).toBe(200);
    const body = await res.json();

    expect(Array.isArray(body.recursos)).toBe(true);
    expect(body.page).toBe(1);
    expect(body.recursos.length).toBeLessThanOrEqual(20);

    // Verificar que cada recurso incluye el arreglo de asignaciones
    // y que las asignaciones mostradas no están desmovilizadas
    for (const recurso of body.recursos) {
      expect(Array.isArray(recurso.asignaciones)).toBe(true);
      for (const asignacion of recurso.asignaciones) {
        expect(asignacion.fechaHoraDesmovilizacion).toBeNull();
        // Si hay asignación activa, debe incluir los datos del incidente
        expect(asignacion.incidente).toBeDefined();
        expect(asignacion.incidente.folio).toBeDefined();
      }
    }


  });
});