/**
 * Valeurs du compte à rebours, calculées au build.
 *
 * Deux endroits les affichent — le grand bandeau sous le hero et le
 * minuteur compact de la barre haute — et le même script les rafraîchit
 * ensuite chaque seconde (voir Countdown.astro).
 */
import { countdown } from '../content/site';

export type Unite = 'jours' | 'heures' | 'minutes' | 'secondes';

const deuxChiffres = (n: number) => String(n).padStart(2, '0');

export function valeursCompte(cible: string = countdown.cible): Record<Unite, string> {
  const reste = Math.max(0, new Date(cible).getTime() - Date.now());
  return {
    jours: String(Math.floor(reste / 86400000)),
    heures: deuxChiffres(Math.floor(reste / 3600000) % 24),
    minutes: deuxChiffres(Math.floor(reste / 60000) % 60),
    secondes: deuxChiffres(Math.floor(reste / 1000) % 60),
  };
}
