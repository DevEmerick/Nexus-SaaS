// Mapeamento de Hex Codes para nomes de cores do PALETTE
export const HEX_TO_COLOR_NAME = {
  '#6366f1': 'indigo',    // Azul índigo (padrão)
  '#ef4444': 'rose',      // Vermelho/rosa
  '#f59e0b': 'amber',     // Âmbar/laranja
  '#10b981': 'emerald',   // Verde esmeralda
  '#06b6d4': 'cyan',      // Ciano/azul claro
  '#a855f7': 'purple',    // Roxo
  '#64748b': 'slate',     // Cinza/slate
};

/**
 * Converte um hex code para o nome da cor no PALETTE
 * Se o hex não estiver mapeado, retorna 'indigo' como fallback
 * @param {string} hexColor - Código hex da cor (ex: '#6366f1')
 * @returns {string} Nome da cor no PALETTE (ex: 'indigo')
 */
export function getColorNameFromHex(hexColor) {
  if (!hexColor) return 'indigo';
  
  const colorName = HEX_TO_COLOR_NAME[hexColor.toLowerCase()];
  return colorName || 'indigo'; // fallback para indigo se não encontrar
}

/**
 * Lista de cores disponíveis no projeto (nomes)
 */
export const AVAILABLE_COLORS = Object.values(HEX_TO_COLOR_NAME);
