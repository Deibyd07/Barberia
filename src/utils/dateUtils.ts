/**
 * Utilidades para manejo de fechas sin problemas de zona horaria
 */

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD sin problemas de zona horaria
 */
export const getTodayString = (): string => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

/**
 * Obtiene una fecha específica en formato YYYY-MM-DD sin problemas de zona horaria
 */
export const getDateString = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * Crea un objeto Date a partir de una string YYYY-MM-DD sin problemas de zona horaria
 */
export const createLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month - 1 porque Date usa 0-indexado
};

/**
 * Obtiene el día de la semana (0-6) de una fecha string YYYY-MM-DD
 */
export const getDayOfWeek = (dateString: string): number => {
  const date = createLocalDate(dateString);
  return date.getDay();
};

/**
 * Obtiene el nombre del día de la semana
 */
export const getDayName = (dayOfWeek: number): string => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[dayOfWeek];
};

/**
 * Formatea una fecha string para mostrar al usuario
 */
export const formatDateForDisplay = (dateString: string): string => {
  const date = createLocalDate(dateString);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Formatea una fecha string para mostrar de forma corta
 */
export const formatDateShort = (dateString: string): string => {
  const date = createLocalDate(dateString);
  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Verifica si una fecha es hoy
 */
export const isToday = (dateString: string): boolean => {
  return dateString === getTodayString();
};

/**
 * Verifica si una fecha es en el futuro
 */
export const isFutureDate = (dateString: string): boolean => {
  return dateString > getTodayString();
};

/**
 * Verifica si una fecha es en el pasado
 */
export const isPastDate = (dateString: string): boolean => {
  return dateString < getTodayString();
};




