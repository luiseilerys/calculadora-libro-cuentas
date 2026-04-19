/**
 * Servicio de cálculo de vuelto exacto
 * Usa enteros (centavos) para evitar errores de punto flotante
 */

const ChangeCalculator = {
    /**
     * Calcula el vuelto exacto usando algoritmo greedy
     * @param {number} totalPagar - El monto a pagar en dólares
     * @param {number} entregado - El monto entregado por el cliente en dólares
     * @param {number[]} denoms - Array de denominaciones disponibles en dólares
     * @returns {Object} Resultado con vuelto, cambio o error
     */
    calcularVueltoExacto(totalPagar, entregado, denoms = Config.denominations) {
        // Convertir todo a centavos (enteros) desde el inicio
        const totalCent = Utils.dollarsToCents(totalPagar);
        const entregadoCent = Utils.dollarsToCents(entregado);

        // Verificar si el monto entregado es suficiente
        if (entregadoCent < totalCent) {
            return { error: 'Insuficiente' };
        }

        let vueltoCent = entregadoCent - totalCent;

        // Si no hay vuelto, retornar directamente
        if (vueltoCent === 0) {
            return { vuelto: 0, vueltoCents: 0, cambio: {} };
        }

        let restante = vueltoCent;
        const cambio = {};
        
        // Ordenar denominaciones de mayor a menor y convertir a centavos
        const sorted = [...denoms].sort((a, b) => b - a);

        // Algoritmo greedy para dar el cambio (usando centavos)
        for (let d of sorted) {
            const dCent = Utils.dollarsToCents(d);
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
                resto: Utils.centsToDollars(restante),
                restoCents: restante
            };
        }

        return { 
            vuelto: Utils.centsToDollars(vueltoCent), 
            vueltoCents: vueltoCent,
            cambio 
        };
    }
};

// Exportar para uso global
window.ChangeCalculator = ChangeCalculator;
