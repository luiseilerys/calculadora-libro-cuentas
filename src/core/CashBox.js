/**
 * Modelo de Caja de Efectivo
 * Usa enteros (centavos) para evitar errores de punto flotante
 */

class CashBox {
    constructor(name, id = null) {
        this.id = id || Utils.generateId();
        this.name = name;
        this.transactions = [];
        this.sessions = [];
        this.quantities = {};
        
        // Inicializar cantidades en 0 para cada denominación
        Config.denominations.forEach(d => this.quantities[d] = 0);
    }

    /**
     * Obtiene el balance total de la caja en centavos (entero)
     */
    getBalanceCents() {
        return this.transactions.reduce((acc, t) => {
            return acc + (t.tipo === 'ingreso' ? t.montoCents : -t.montoCents);
        }, 0);
    }

    /**
     * Obtiene el balance total de la caja en dólares (float para display)
     */
    getBalance() {
        return Utils.centsToDollars(this.getBalanceCents());
    }

    /**
     * Agrega una transacción
     */
    addTransaction(concepto, monto, tipo) {
        if (!concepto || concepto.trim() === '') {
            concepto = (tipo === 'ingreso' ? 'Ingreso' : 'Gasto');
        }
        
        if (isNaN(monto) || monto <= 0) {
            return false;
        }

        const now = new Date();
        this.transactions.push({
            id: Utils.generateId(),
            concepto: concepto.trim(),
            monto: monto,
            montoCents: Utils.dollarsToCents(monto),
            tipo: tipo,
            fechaISO: Utils.getISODate(now),
            fechaDisplay: Utils.getFormattedDate(now)
        });

        return true;
    }

    /**
     * Actualiza una transacción existente
     */
    updateTransaction(id, newConcepto, newMonto, newTipo) {
        const idx = this.transactions.findIndex(t => t.id === id);
        if (idx === -1) return false;

        if (!newConcepto || newConcepto.trim() === '') {
            newConcepto = 'Editado';
        }

        if (isNaN(newMonto) || newMonto <= 0) {
            return false;
        }

        this.transactions[idx].concepto = newConcepto.trim();
        this.transactions[idx].monto = newMonto;
        this.transactions[idx].montoCents = Utils.dollarsToCents(newMonto);
        this.transactions[idx].tipo = newTipo;

        return true;
    }

    /**
     * Elimina una transacción por ID
     */
    deleteTransaction(id) {
        const initialLength = this.transactions.length;
        this.transactions = this.transactions.filter(t => t.id !== id);
        return this.transactions.length < initialLength;
    }

    /**
     * Agrega una sesión
     */
    addSession(tipo, total, concepto, denominationsCount) {
        const session = {
            id: Utils.generateId(),
            fecha: Utils.getFormattedDate(),
            tipo: tipo,
            total: total,
            totalCents: Utils.dollarsToCents(total),
            concepto: concepto.trim(),
            denominationsCount: { ...denominationsCount }
        };
        this.sessions.push(session);
        return session;
    }

    /**
     * Obtiene las transacciones ordenadas por fecha (más recientes primero)
     */
    getSortedTransactions() {
        return [...this.transactions].sort((a, b) => 
            new Date(b.fechaISO) - new Date(a.fechaISO)
        );
    }

    /**
     * Obtiene las sesiones en orden inverso
     */
    getSortedSessions() {
        return [...this.sessions].reverse();
    }
}

// Exportar para uso global
window.CashBox = CashBox;
