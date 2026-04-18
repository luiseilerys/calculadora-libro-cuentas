/**
 * Componente de UI - Calculadora de vuelto
 */

const ChangeUI = {
    /**
     * Calcula y muestra el vuelto en la UI
     */
    calcularVuelto() {
        const totalInput = document.getElementById('totalPagar');
        const entregadoInput = document.getElementById('efectivoEntregado');
        const resultDiv = document.getElementById('vueltoResultado');

        const total = parseFloat(totalInput.value);
        const entregado = parseFloat(entregadoInput.value);

        if (isNaN(total) || isNaN(entregado)) {
            resultDiv.innerHTML = '<strong>⚠️ Ingrese números válidos</strong>';
            return;
        }

        const res = ChangeCalculator.calcularVueltoExacto(total, entregado);

        if (res.error === 'Insuficiente') {
            resultDiv.innerHTML = '<strong>💸 Efectivo insuficiente</strong>';
            return;
        }

        if (res.error === 'No exacto') {
            resultDiv.innerHTML = `
                <strong>⚠️ No se puede dar cambio exacto. Sobran ${Utils.formatMoney(res.resto)}</strong>
            `;
            return;
        }

        // Construir HTML del desglose
        let html = `<strong>✅ Vuelto: ${Utils.formatMoney(res.vuelto)}</strong><br>`;
        html += '<div class="denom-detail">';

        for (let [d, cant] of Object.entries(res.cambio)) {
            html += `
                <span class="denom-chip">
                    $${d} x ${cant} = ${Utils.formatMoney(d * cant)}
                </span>
            `;
        }

        html += '</div>';
        resultDiv.innerHTML = html;
    }
};

// Exportar para uso global
window.ChangeUI = ChangeUI;
