import { z } from "zod";

export const esquemaLogin = z.object({
  correo: z.string().min(1, "El correo es obligatorio").email("Correo no válido"),
  contrasena: z.string().min(1, "La contraseña es obligatoria"),
});

export type DatosLogin = z.infer<typeof esquemaLogin>;
