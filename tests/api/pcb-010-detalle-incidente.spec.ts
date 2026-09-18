import { test, expect } from '@playwright/test';
import { loginExitoso } from '../helpers/auth';

const CORREO = process.env.TEST_USER_EMAIL ?? 'admin@geciva.mx';
const CONTRASENA = process.env.TEST_USER_PASSWORD ?? 'Geciva2026!';

test.describe('PCB-010 — Consulta de detalle de incidente', () => {
  test.beforeEach(async ({ page }) => {
    await loginExitoso(page, CORREO, CONTRASENA);
  });

  test('Camino 1: id no numérico responde ID inválido', async ({ page }) => {
    const res = await page.request.get('/api/incidentes/abc');
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('ID inválido');
  });

  test('Camino 2: id inexistente responde incidente no encontrado', async ({ page }) => {
    const res = await page.request.get('/api/incidentes/999999');
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Incidente no encontrado');
  });

  test('Camino 3: id existente devuelve incidente con relaciones', async ({ page }) => {
    // Primero obtener un id válido del listado
    const listaRes = await page.request.get('/api/incidentes?limit=1');
    expect(listaRes.status()).toBe(200);
    const lista = await listaRes.json();
    expect(lista.incidentes.length).toBeGreaterThan(0);
    const idExistente = lista.incidentes[0].idIncidente;

    // Consultar el detalle
    const res = await page.request.get(`/api/incidentes/${idExistente}`);
    expect(res.status()).toBe(200);
    const incidente = await res.json();

    // Verificar estructura completa
    expect(incidente.idIncidente).toBe(idExistente);
    expect(incidente.folio).toBeDefined();
    expect(incidente.usuarioRegistro).toBeDefined();
    expect(Array.isArray(incidente.victimas)).toBe(true);
    expect(Array.isArray(incidente.asignacionesRecurso)).toBe(true);
    expect(Array.isArray(incidente.formulariosSci)).toBe(true);
    expect(Array.isArray(incidente.periodosOperacionales)).toBe(true);
    expect(Array.isArray(incidente.planesAccion)).toBe(true);
  });
});