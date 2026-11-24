/**
 * Define a sombra padrão de cartão a partir das cores do tema.
 * Depende de colors; fica disponível pelo índice de theme para uso em estilos.
 */

import { colors } from './colors';
export const shadows = { card: { shadowColor: colors.text, shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 } } as const;
