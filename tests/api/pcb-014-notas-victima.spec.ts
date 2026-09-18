import { test, expect, Page } from '@playwright/test';
import { loginExitoso } from '../helpers/auth';

const CORREO = process.env.TEST_USER_EMAIL ?? 'admin@geciva.mx';
const CONTRASENA = process.env.TEST_USER_PASSWORD ?? 'Geciva2026!';

async function crearVictimaDePrueba(page: Page): Promise<number> {
  const incRes = await page.request.get('/api/incidentes?estado=ACTIVO&limit=1');
  expect(incRes.status()).toBe(200);
  const incBody = await incRes.json();
  expect(incBody.incidentes.length).toBeGreaterThan(0);
  const idIncidente = incBody.incidentes[0].idIncidente;

  const res = await page.request.post('/api/victimas', {
    data: {
      idIncidente,
      lugarRegistro: 'Lugar de prueba PCB-014',
      notasAdicionales: 'Notas iniciales',
    },
  });
  expect(res.status()).toBe(201);
  const body = await res.json();
  return body.idVictima;
}

test.describe('PCB-014 — Notas adicionales de víctima', () => {
  test.beforeEach(async ({ page }) => {
    await loginExitoso(page, CORREO, CONTRASENA);
  });

  test('Camino 1: datos inválidos responde error de validación', async ({ page }) => {
    const idVictima = await crearVictimaDePrueba(page);

    const res = await page.request.put(`/api/victimas/${idVictima}`, {
      data: { edad: -5 },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Datos inválidos');
    expect(Array.isArray(body.details)).toBe(true);
  });

  test('Camino 2: víctima inexistente responde no encontrada', async ({ page }) => {
    const res = await page.request.put('/api/victimas/999999', {
      data: { notasAdicionales: 'Paciente estable' },
    });

    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Víctima no encontrada');
  });

  test('Camino 3: actualización de notas con caracteres especiales', async ({ page }) => {
    const idVictima = await crearVictimaDePrueba(page);
    const notas = 'Se añaden caracteres especiales: ñ, á, é, í, ó, ú';

    const res = await page.request.put(`/api/victimas/${idVictima}`, {
      data: { notasAdicionales: notas },
    });

    expect(res.status()).toBe(200);
    const victima = await res.json();
    expect(victima.idVictima).toBe(idVictima);
    expect(victima.notasAdicionales).toBe(notas);
    expect(victima.usuarioRegistro).toBeDefined();
    expect(victima.usuarioRegistro.nombreCompleto).toBeDefined();
  });
});