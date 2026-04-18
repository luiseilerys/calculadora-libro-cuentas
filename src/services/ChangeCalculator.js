/**
 * Servicio de cálculo de vuelto exacto
 */

const ChangeCalculator = {
    /**
     * Calcula el vuelto exacto usando algoritmo greedy
     * @param {number} totalPagar - El monto a pagar
     * @param {number} entregado - El monto entregado por el cliente
     * @param {number[]} denoms - Array de denominaciones disponibles
     * @returns {Object} Resultado con vuelto, cambio o error
     */
    calcularVueltoExacto(totalPagar, entregado, denoms = Config.denominations) {
        const totalCent = Math.round(totalPagar * 100);
        const entregadoCent = Math.round(entregado * 100);

        // Verificar si el monto entregado es suficiente
        if (entregadoCent < totalCent) {
            return { error: 'Insuficiente' };
        }

        let vueltoCent = entregadoCent - totalCent;

        // Si no hay vuelto, retornar directamente
        if (vueltoCent === 0) {
            return { vuelto: 0, cambio: {} };
        }

        let restante = vueltoCent;
        const cambio = {};
        
        // Ordenar denominaciones de mayor a menor
        const sorted = [...denoms].sort((a, b) => b - a);

        // Algoritmo greedy para dar el cambio
        for (let d of sorted) {
            const dCent = d * 100;
            const cant = Math.floor(restante / dCent);
            
            if (cant > 0) {
                cambio[d] = cant;
                restante -= cant * dCent;
            }
        }

        // Verificar si se pudo dar cambio exacto
        if (restante > 0) {
            return { 
                error: 'No exacto', 
                resto: restante / 100 
            };
        }

        return { 
            vuelto: vueltoCent / 100, 
            cambio 
        };
    }
};

// Exportar para uso global
window.ChangeCalculator = ChangeCalculator;
