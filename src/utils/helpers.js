/**
 * Utilidades para MultiCajas
 */

const Utils = {
    /**
     * Convierte un monto en centavos (entero) a dólares (float para display)
     * @param {number} cents - Monto en centavos
     * @returns {number} Monto en dólares
     */
    centsToDollars(cents) {
        return cents / 100;
    },

    /**
     * Convierte un monto en dólares a centavos (entero)
     * @param {number} dollars - Monto en dólares
     * @returns {number} Monto en centavos (redondeado)
     */
    dollarsToCents(dollars) {
        return Math.round(dollars * 100);
    },

    /**
     * Formatea un número como moneda USD
     * @param {number} val - Valor en dólares (puede ser float o entero centavos)
     * @param {boolean} isCents - Si true, val está en centavos
     */
    formatMoney(val, isCents = false) {
        const amount = isCents ? this.centsToDollars(val) : val;
        return new Intl.NumberFormat('es-ES', { 
            style: 'currency', 
            currency: 'USD', 
            minimumFractionDigits: 2 
        }).format(amount);
    },

    /**
     * Escapa caracteres HTML para prevenir XSS
     */
    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"'/]/g, m => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;'
        }[m]));
    },

    /**
     * Genera un ID único
     */
    generateId() {
        return Date.now() + Math.random();
    },

    /**
     * Obtiene la fecha y hora formateada para display
     */
    getFormattedDate(date = new Date()) {
        return date.toLocaleString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
    },

    /**
     * Obtiene el ISO string de una fecha
     */
    getISODate(date = new Date()) {
        return date.toISOString();
    }
};

// Exportar para uso global
window.Utils = Utils;
