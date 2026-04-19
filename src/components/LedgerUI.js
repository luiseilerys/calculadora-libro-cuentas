/**
 * Componente de UI - Libro de cuentas (Ledger)
 * Usa enteros (centavos) para mostrar montos
 */

const LedgerUI = {
    /**
     * Renderiza la lista de transacciones en el DOM
     */
    renderLedger(box) {
        const container = document.getElementById('transaccionesContainer');

        if (!box || box.transactions.length === 0) {
            container.innerHTML = '<div class="empty-message">No hay movimientos.</div>';
            return;
        }

        let html = '';
        const sortedTransactions = box.getSortedTransactions();

        for (let t of sortedTransactions) {
            const colorStyle = t.tipo === 'ingreso' ? 'color:#a3e635' : 'color:#f87171';
            const sign = t.tipo === 'ingreso' ? '+' : '-';

            html += `
                <div class="transaccion-item">
                    <div>${Utils.escapeHtml(t.concepto)}</div>
                    <div>
                        <span class="tipo-badge ${t.tipo}">
                            ${t.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                        </span>
                    </div>
                    <div style="${colorStyle}">
                        ${sign} ${Utils.formatMoney(t.montoCents, true)}
                    </div>
                    <div style="font-size:0.7rem;">
                        ${Utils.escapeHtml(t.fechaDisplay)}
                    </div>
                    <div>
                        <button class="edit-btn" data-id="${t.id}">✏️</button>
                        <button class="delete-btn" data-id="${t.id}">🗑️</button>
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
        this.bindLedgerEvents(box);
    },

    /**
     * Vincula los eventos de editar y eliminar
     */
    bindLedgerEvents(box) {
        // Eventos de editar
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseFloat(btn.getAttribute('data-id'));
                this.openEditModal(id, box);
            });
        });

        // Eventos de eliminar
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseFloat(btn.getAttribute('data-id'));
                if (confirm('¿Eliminar movimiento?')) {
                    box.deleteTransaction(id);
                    this.renderLedger(box);
                }
            });
        });
    },

    /**
     * Abre el modal de edición
     */
    openEditModal(id, box) {
        const trans = box.transactions.find(t => t.id === id);
        if (!trans) return;

        document.getElementById('editConcepto').value = trans.concepto;
        document.getElementById('editMonto').value = trans.monto;
        document.getElementById('editTipo').value = trans.tipo;

        this.currentEditId = id;
        document.getElementById('editModal').style.display = 'flex';
    },

    /**
     * Guarda los cambios del modal de edición
     */
    saveEdit(box, refreshCallback) {
        const id = this.currentEditId;
        const newConcepto = document.getElementById('editConcepto').value;
        const newMonto = parseFloat(document.getElementById('editMonto').value);
        const newTipo = document.getElementById('editTipo').value;

        if (!id || !box.updateTransaction(id, newConcepto, newMonto, newTipo)) {
            alert('Monto inválido (debe ser positivo)');
            return false;
        }
        
        if (refreshCallback) refreshCallback();
        document.getElementById('editModal').style.display = 'none';
        return true;
    }
};

// Exportar para uso global
window.LedgerUI = LedgerUI;
