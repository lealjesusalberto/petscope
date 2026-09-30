/**
 * Calculate human-readable age from a birth date string (YYYY-MM-DD)
 * Returns formatted text in Spanish like:
 * - "2 años y 4 meses"
 * - "1 año"
 * - "6 meses"
 * - "3 semanas"
 * - "5 días"
 */
export function calculateAgeFromBirthDate(birthDateStr) {
  if (!birthDateStr) return '';
  
  const birth = new Date(birthDateStr + 'T00:00:00');
  if (isNaN(birth.getTime())) return '';

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (birth > now) {
    return 'Fecha futura no válida';
  }

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    // Get total days in previous month
    const prevMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonthDays;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  // Format years & months
  if (years > 0) {
    const yearLabel = years === 1 ? '1 año' : `${years} años`;
    if (months === 0) {
      return yearLabel;
    }
    const monthLabel = months === 1 ? '1 mes' : `${months} meses`;
    return `${yearLabel} y ${monthLabel}`;
  }

  // Under 1 year
  if (months > 0) {
    const monthLabel = months === 1 ? '1 mes' : `${months} meses`;
    if (days >= 7) {
      const weeks = Math.floor(days / 7);
      return `${monthLabel} y ${weeks} ${weeks === 1 ? 'sem.' : 'sems.'}`;
    }
    return monthLabel;
  }

  // Under 1 month
  const diffTime = Math.abs(now - birth);
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (totalDays >= 7) {
    const weeks = Math.floor(totalDays / 7);
    return `${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
  }

  if (totalDays <= 1) {
    return 'Recién nacido';
  }

  return `${totalDays} días`;
}

/**
 * Format birthdate for display (e.g. "15 de mayo de 2022")
 */
export function formatBirthDateDisplay(birthDateStr) {
  if (!birthDateStr) return '';
  const [year, month, day] = birthDateStr.split('-');
  if (!year || !month || !day) return birthDateStr;

  const monthsEs = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const monthIdx = parseInt(month, 10) - 1;
  const monthName = monthsEs[monthIdx] || month;
  return `${parseInt(day, 10)} de ${monthName} de ${year}`;
}
