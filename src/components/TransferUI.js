/**
 * Componente de UI - Transferencias entre cuentas
 */

const TransferUI = {
    /**
     * Actualiza los selectores de transferencia con las cajas disponibles
     */
    updateTransferSelectors(boxes) {
        const fromSelect = document.getElementById('transferFrom');
        const toSelect = document.getElementById('transferTo');

        if (!fromSelect || !toSelect) return;

        const options = boxes.map(b => 
            `<option value="${b.id}">${Utils.escapeHtml(b.name)}</option>`
        ).join('');

        fromSelect.innerHTML = options;
        toSelect.innerHTML = options;

        // Asegurar que no se seleccione la misma caja en ambos
        this.bindTransferSelectorEvents(fromSelect, toSelect, boxes);
    },

    /**
     * Vincula eventos para evitar seleccionar la misma caja
     */
    bindTransferSelectorEvents(fromSelect, toSelect, boxes) {
        fromSelect.addEventListener('change', () => {
            if (fromSelect.value === toSelect.value) {
                const other = boxes.find(b => b.id !== parseFloat(fromSelect.value));
                if (other) toSelect.value = other.id;
            }
        });

        toSelect.addEventListener('change', () => {
            if (toSelect.value === fromSelect.value) {
                const other = boxes.find(b => b.id !== parseFloat(toSelect.value));
                if (other) fromSelect.value = other.id;
            }
        });
    },

    /**
     * Realiza una transferencia entre cuentas
     */
    realizarTransferencia(boxes, currentBoxId, refreshCallback) {
        const fromId = parseFloat(document.getElementById('transferFrom').value);
        const toId = parseFloat(document.getElementById('transferTo').value);
        const monto = parseFloat(document.getElementById('transferAmount').value);
        let concepto = document.getElementById('transferConcept').value.trim();

        // Validaciones
        if (fromId === toId) {
            alert('No puedes transferir a la misma cuenta');
            return false;
        }

        if (isNaN(monto) || monto <= 0) {
            alert('Monto inválido');
            return false;
        }

        const fromBox = boxes.find(b => b.id === fromId);
        const toBox = boxes.find(b => b.id === toId);

        if (!fromBox || !toBox) {
            alert('Cuentas no encontradas');
            return false;
        }

        // Verificar saldo suficiente
        const saldoOrigen = fromBox.getBalance();
        if (saldoOrigen < monto) {
            if (!confirm(`Saldo insuficiente (${Utils.formatMoney(saldoOrigen)}). ¿Deseas continuar?`)) {
                return false;
            }
        }

        // Crear concepto por defecto si está vacío
        if (!concepto) {
            concepto = `Transferencia a ${toBox.name}`;
        }

        // Registrar transacciones en ambas cajas
        fromBox.addTransaction(`(Transferencia) ${concepto}`, monto, 'gasto');
        toBox.addTransaction(`(Transferencia) ${concepto} desde ${fromBox.name}`, monto, 'ingreso');

        // Limpiar formulario
        document.getElementById('transferAmount').value = '';
        document.getElementById('transferConcept').value = '';

        if (refreshCallback) refreshCallback();

        return true;
    }
};

// Exportar para uso global
window.TransferUI = TransferUI;
