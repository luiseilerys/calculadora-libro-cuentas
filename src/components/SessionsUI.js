/**
 * Componente de UI - Sesiones
 * Usa enteros (centavos) para mostrar montos
 */

const SessionsUI = {
    /**
     * Renderiza la lista de sesiones en el DOM
     */
    renderSessions(box) {
        const container = document.getElementById('sesionesContainer');

        if (!box || box.sessions.length === 0) {
            container.innerHTML = '<div class="empty-message">No hay sesiones.</div>';
            return;
        }

        let html = '';
        const sortedSessions = box.getSortedSessions();

        for (let s of sortedSessions) {
            html += `
                <div class="sesion-item">
                    <div style="font-size:0.7rem;">${Utils.escapeHtml(s.fecha)}</div>
                    <div>
                        <span class="tipo-badge ${s.tipo}">
                            ${s.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                        </span>
                    </div>
                    <div>${Utils.formatMoney(s.totalCents, true)}</div>
                    <div>${Utils.escapeHtml(s.concepto)}</div>
                    <div>
                        <button class="detail-btn" data-id="${s.id}">🔍</button>
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
        this.bindSessionsEvents(box);
    },

    /**
     * Vincula los eventos de ver detalle
     */
    bindSessionsEvents(box) {
        document.querySelectorAll('.detail-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const session = box.sessions.find(s => String(s.id) === String(id));
                if (session) {
                    this.showSessionDetail(session);
                }
            });
        });
    },

    /**
     * Muestra el modal con el detalle de una sesión
     */
    showSessionDetail(session) {
        document.getElementById('modalConcepto').textContent = session.concepto;
        document.getElementById('modalTotal').textContent = Utils.formatMoney(session.totalCents, true);

        const container = document.getElementById('modalDenomDetail');
        container.innerHTML = '';

        for (let [den, qty] of Object.entries(session.denominationsCount)) {
            if (qty > 0) {
                const subtotalCents = Utils.dollarsToCents(den) * qty;
                container.innerHTML += `
                    <span class="denom-chip">
                        $${den} x ${qty} = ${Utils.formatMoney(subtotalCents, true)}
                    </span>
                `;
            }
        }

        document.getElementById('sessionModal').style.display = 'flex';
    }
};

// Exportar para uso global
window.SessionsUI = SessionsUI;
