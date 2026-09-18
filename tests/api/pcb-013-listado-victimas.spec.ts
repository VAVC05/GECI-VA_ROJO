import { test, expect } from '@playwright/test';
import { loginExitoso } from '../helpers/auth';

const CORREO = process.env.TEST_USER_EMAIL ?? 'admin@geciva.mx';
const CONTRASENA = process.env.TEST_USER_PASSWORD ?? 'Geciva2026!';

test.describe('PCB-013 — Listado de víctimas con historial de triage', () => {
  test.beforeEach(async ({ page }) => {
    await loginExitoso(page, CORREO, CONTRASENA);
  });

  test('Camino 1: filtro por idIncidente y estado', async ({ page }) => {
    // Obtener un incidente válido del listado
    const listaRes = await page.request.get('/api/incidentes?limit=1');
    expect(listaRes.status()).toBe(200);
    const lista = await listaRes.json();
    expect(lista.incidentes.length).toBeGreaterThan(0);
    const idIncidente = lista.incidentes[0].idIncidente;

    const res = await page.request.get(
      `/api/victimas?idIncidente=${idIncidente}&estado=TRASLADADO`
    );
    expect(res.status()).toBe(200);
    const body = await res.json();

    expect(Array.isArray(body.victimas)).toBe(true);
    expect(body).toHaveProperty('total');
    expect(body).toHaveProperty('page');
    expect(body).toHaveProperty('totalPages');

    // Todas las víctimas devueltas deben pertenecer al incidente y estar trasladadas
    for (const victima of body.victimas) {
      expect(victima.idIncidente).toBe(idIncidente);
      expect(victima.estadoAtencion).toBe('TRASLADADO');
    }
  });

  test('Camino 2: filtro solo por idIncidente', async ({ page }) => {
    const listaRes = await page.request.get('/api/incidentes?limit=1');
    const lista = await listaRes.json();
    expect(lista.incidentes.length).toBeGreaterThan(0);
    const idIncidente = lista.incidentes[0].idIncidente;

    const res = await page.request.get(`/api/victimas?idIncidente=${idIncidente}`);
    expect(res.status()).toBe(200);
    const body = await res.json();

    expect(Array.isArray(body.victimas)).toBe(true);

    // Todas las víctimas deben pertenecer al incidente
    for (const victima of body.victimas) {
      expect(victima.idIncidente).toBe(idIncidente);
    }

    // Cada víctima debe incluir su historial de triage y usuario de registro
    for (const victima of body.victimas) {
      expect(victima.usuarioRegistro).toBeDefined();
      expect(Array.isArray(victima.historialTriage)).toBe(true);
    }
  });

  test('Camino 3: sin filtros devuelve todas las víctimas paginadas', async ({ page }) => {
    const res = await page.request.get('/api/victimas');
    expect(res.status()).toBe(200);
    const body = await res.json();

    expect(body.page).toBe(1);
    expect(body.totalPages).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(body.victimas)).toBe(true);
    expect(body.victimas.length).toBeLessThanOrEqual(20);

    // Cada víctima debe incluir las relaciones esperadas
    for (const victima of body.victimas) {
      expect(victima.usuarioRegistro).toBeDefined();
      expect(Array.isArray(victima.historialTriage)).toBe(true);
    }
  });
});