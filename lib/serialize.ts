/** Convierte resultados de la base de datos en datos seguros para RSC. */
export function toClientData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
