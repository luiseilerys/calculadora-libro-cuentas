/**
 * Componente de UI - Calculadora de denominaciones
 * Usa enteros (centavos) para cálculos internos
 */

const CalculatorUI = {
    currentTotal: 0,
    currentTotalCents: 0,

    /**
     * Construye la tabla de denominaciones en el DOM
     */
    buildDenomTable() {
        const tbody = document.getElementById('denomTableBody');
        tbody.innerHTML = '';

        for (let d of Config.denominations) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>$${d}</td>
                <td>
                    <input type="number" min="0" step="1" id="input-${d}" value="0">
                </td>
                <td><span id="subtotal-${d}">$0.00</span></td>
            `;
            tbody.appendChild(row);

            const input = document.getElementById(`input-${d}`);
            input.addEventListener('input', (e) => {
                this.handleQuantityChange(d, e.target.value);
            });
        }
    },

    /**
     * Maneja el cambio en la cantidad de una denominación
     */
    handleQuantityChange(den, val, box) {
        if (!box) return;

        let raw = parseInt(val);
        if (isNaN(raw) || raw < 0) raw = 0;

        box.quantities[den] = raw;
        this.updateCalculatorUI(box);
    },

    /**
     * Actualiza la UI de la calculadora
     */
    updateCalculatorUI(box) {
        if (!box) return;

        let totalCents = 0;
        let totalBills = 0;

        for (let d of Config.denominations) {
            const q = box.quantities[d] || 0;
            const denomCents = Utils.dollarsToCents(d);
            const subtotalCents = denomCents * q;
            
            totalCents += subtotalCents;
            totalBills += q;

            const span = document.getElementById(`subtotal-${d}`);
            if (span) span.textContent = Utils.formatMoney(subtotalCents, true);

            const inp = document.getElementById(`input-${d}`);
            if (inp && inp.value != q) inp.value = q;
        }

        const total = Utils.centsToDollars(totalCents);
        document.getElementById('totalGeneral').textContent = Utils.formatMoney(totalCents, true);
        document.getElementById('totalBilletes').textContent = totalBills;
        this.currentTotal = total;
        this.currentTotalCents = totalCents;

        return { total, totalCents, totalBills };
    },

    /**
     * Limpia todas las cantidades
     */
    clearAllQuantities(box) {
        if (!box) return;

        for (let d of Config.denominations) {
            box.quantities[d] = 0;
        }

        this.updateCalculatorUI(box);
    },

    /**
     * Obtiene el total actual calculado en dólares
     */
    getCurrentTotal() {
        return this.currentTotal;
    },

    /**
     * Obtiene el total actual calculado en centavos
     */
    getCurrentTotalCents() {
        return this.currentTotalCents;
    }
};

// Exportar para uso global
window.CalculatorUI = CalculatorUI;
