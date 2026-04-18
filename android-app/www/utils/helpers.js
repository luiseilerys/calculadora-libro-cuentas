/**
 * Utilidades para MultiCajas
 */

const Utils = {
    /**
     * Formatea un número como moneda USD
     */
    formatMoney(val) {
        return new Intl.NumberFormat('es-ES', { 
            style: 'currency', 
            currency: 'USD', 
            minimumFractionDigits: 2 
        }).format(val);
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
