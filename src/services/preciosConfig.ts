export const tiposPrecioCargo: Record<"general" | "mayoreo" | "especial", number> = {
  general: 0,
  mayoreo: 5,
  especial: 8,
}

export type TipoPrecio = keyof typeof tiposPrecioCargo
