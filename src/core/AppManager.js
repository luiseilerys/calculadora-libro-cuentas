/**
 * Gestor principal de la aplicación MultiCajas
 * Coordina todos los módulos y componentes
 */

const AppManager = {
    boxes: [],
    currentBoxId: null,

    /**
     * Inicializa la aplicación
     */
    init() {
        this.loadState();
        this.bindGlobalEvents();
        this.setupTabs();
        this.renderAll();
    },

    /**
     * Carga el estado desde localStorage
     */
    loadState() {
        const data = StorageService.loadBoxes();
        this.boxes = data.boxes;
        this.currentBoxId = data.currentBoxId;
    },

    /**
     * Guarda el estado en localStorage
     */
    saveState() {
        StorageService.saveBoxes(this.boxes, this.currentBoxId);
    },

    /**
     * Obtiene la caja actual
     */
    getCurrentBox() {
        return this.boxes.find(b => b.id == this.currentBoxId);
    },

    /**
     * Renderiza toda la UI
     */
    renderAll() {
        const box = this.getCurrentBox();

        // Actualizar selector de cajas
        this.updateBoxSelector();

        // Actualizar balance global
        this.updateGlobalBalance(box);

        // Actualizar calculadora
        if (box) {
            CalculatorUI.updateCalculatorUI(box);
        }

        // Renderizar libro de cuentas
        LedgerUI.renderLedger(box);

        // Renderizar sesiones
        SessionsUI.renderSessions(box);

        // Actualizar selectores de transferencia
        TransferUI.updateTransferSelectors(this.boxes);
    },

    /**
     * Actualiza el selector de cajas
     */
    updateBoxSelector() {
        const select = document.getElementById('boxSelect');
        if (!select) return;

        select.innerHTML = this.boxes.map(b => 
            `<option value="${b.id}" ${b.id == this.currentBoxId ? 'selected' : ''}>
                ${Utils.escapeHtml(b.name)}
            </option>`
        ).join('');
    },

    /**
     * Actualiza el balance global mostrado
     */
    updateGlobalBalance(box) {
        const balEl = document.getElementById('globalBalance');
        if (!balEl || !box) return;

        const saldo = box.getBalance();
        balEl.textContent = Utils.formatMoney(saldo);
        balEl.className = 'balance-amount ' + (saldo >= 0 ? 'positive' : 'negative');
    },

    /**
     * Configura el sistema de pestañas
     */
    setupTabs() {
        const tabs = ['calculator', 'ledger', 'sessions', 'change', 'transfer', 'backup', 'tests'];

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');

                // Mostrar contenido de la pestaña seleccionada
                tabs.forEach(t => {
                    document.getElementById(`tab-${t}`).classList.toggle('active', t === tabId);
                });

                // Actualizar estado activo del botón
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Iniciar tests si es la pestaña de pruebas
                if (tabId === 'tests' && typeof QUnit !== 'undefined') {
                    QUnit.start();
                }
            });
        });
    },

    /**
     * Vincula eventos globales
     */
    bindGlobalEvents() {
        // Selector de caja
        document.getElementById('boxSelect').addEventListener('change', (e) => {
            this.currentBoxId = Number(e.target.value);
            this.saveState();
            this.renderAll();
        });

        // Botones de gestión de cajas
        document.getElementById('newBoxBtn').addEventListener('click', () => this.newBox());
        document.getElementById('renameBoxBtn').addEventListener('click', () => this.renameBox());
        document.getElementById('deleteBoxBtn').addEventListener('click', () => this.deleteBox());

        // Calculadora
        document.getElementById('clearAllDenoms').addEventListener('click', () => {
            CalculatorUI.clearAllQuantities(this.getCurrentBox());
            this.saveState();
        });
        document.getElementById('registerIncome').addEventListener('click', () => this.registerFromCalculator('ingreso'));
        document.getElementById('registerExpense').addEventListener('click', () => this.registerFromCalculator('gasto'));

        // Libro de cuentas
        document.getElementById('loadExampleBtn').addEventListener('click', () => this.loadExample());
        document.getElementById('saveEditBtn').addEventListener('click', () => {
            LedgerUI.saveEdit(this.getCurrentBox(), () => {
                this.saveState();
                this.renderAll();
            });
        });
        document.getElementById('cancelEditBtn').addEventListener('click', () => {
            document.getElementById('editModal').style.display = 'none';
        });

        // Sesiones
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            document.getElementById('sessionModal').style.display = 'none';
        });

        // Vuelto
        document.getElementById('calcularVueltoBtn').addEventListener('click', () => ChangeUI.calcularVuelto());

        // Transferencias
        document.getElementById('doTransferBtn').addEventListener('click', () => {
            if (TransferUI.realizarTransferencia(this.boxes, this.currentBoxId, () => {
                this.saveState();
                this.renderAll();
            })) {
                alert('Transferencia realizada con éxito');
            }
        });

        // Backup
        document.getElementById('exportBackupBtn').addEventListener('click', () => this.exportBackup());
        document.getElementById('importBackupInput').addEventListener('change', (e) => {
            if (e.target.files.length) {
                this.importBackup(e.target.files[0]);
            }
            e.target.value = '';
        });

        // Cerrar modales al hacer click fuera
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('editModal')) {
                document.getElementById('editModal').style.display = 'none';
            }
            if (e.target === document.getElementById('sessionModal')) {
                document.getElementById('sessionModal').style.display = 'none';
            }
        });
    },

    /**
     * Registra un ingreso o gasto desde la calculadora
     */
    registerFromCalculator(tipo) {
        const box = this.getCurrentBox();
        const total = CalculatorUI.getCurrentTotal();

        if (!total || total <= 0) {
            alert('No hay efectivo contado.');
            return;
        }

        let concepto = prompt(
            `Concepto para ${tipo === 'ingreso' ? 'INGRESO' : 'GASTO'} de ${Utils.formatMoney(total)}:`,
            tipo === 'ingreso' ? 'Ingreso efectivo' : 'Gasto efectivo'
        );

        if (!concepto) return;

        // Registrar transacción
        box.addTransaction(concepto, total, tipo);

        // Registrar sesión con desglose
        box.addSession(tipo, total, concepto.trim(), { ...box.quantities });

        this.saveState();

        if (confirm('¿Limpiar cantidades?')) {
            CalculatorUI.clearAllQuantities(box);
            this.saveState();
        }

        this.renderAll();
    },

    /**
     * Crea una nueva caja
     */
    newBox() {
        const name = prompt('Nombre nueva cuenta:');
        if (name) {
            const nb = new CashBox(name);
            this.boxes.push(nb);
            this.currentBoxId = nb.id;
            this.saveState();
            this.renderAll();
        }
    },

    /**
     * Renombra la caja actual
     */
    renameBox() {
        const box = this.getCurrentBox();
        if (box) {
            const nn = prompt('Nuevo nombre:', box.name);
            if (nn) {
                box.name = nn;
                this.saveState();
                this.renderAll();
            }
        }
    },

    /**
     * Elimina la caja actual
     */
    deleteBox() {
        if (this.boxes.length === 1) {
            alert('Debe haber al menos una cuenta');
            return;
        }

        const box = this.getCurrentBox();
        if (box && confirm(`¿Eliminar "${box.name}"?`)) {
            this.boxes = this.boxes.filter(b => b.id !== box.id);
            this.currentBoxId = this.boxes[0].id;
            this.saveState();
            this.renderAll();
        }
    },

    /**
     * Carga datos de ejemplo
     */
    loadExample() {
        const box = this.getCurrentBox();
        if (!box) return;

        const ejemplos = [
            { concepto: 'Sueldo', monto: 1850, tipo: 'ingreso' },
            { concepto: 'Super', monto: 112.3, tipo: 'gasto' }
        ];

        for (let ex of ejemplos) {
            box.addTransaction(ex.concepto, ex.monto, ex.tipo);
        }

        this.saveState();
        this.renderAll();
    },

    /**
     * Exporta backup
     */
    exportBackup() {
        BackupService.exportBackup(this.boxes, this.currentBoxId);
        alert('Backup exportado correctamente.');
    },

    /**
     * Importa backup
     */
    importBackup(file) {
        BackupService.importBackup(
            file,
            // Success callback
            (backupData) => {
                // Reconstruir cajas desde el backup
                this.boxes = backupData.boxes.map(b => {
                    const box = new CashBox(b.name, b.id);
                    box.transactions = b.transactions || [];
                    box.sessions = b.sessions || [];
                    box.quantities = b.quantities || {};
                    
                    // Asegurar denominaciones
                    Config.denominations.forEach(d => {
                        if (box.quantities[d] === undefined) {
                            box.quantities[d] = 0;
                        }
                    });
                    
                    return box;
                });

                this.currentBoxId = backupData.currentBoxId;
                
                // Validar caja actual
                if (!this.boxes.find(b => b.id == this.currentBoxId)) {
                    this.currentBoxId = this.boxes[0]?.id || null;
                }

                this.saveState();
                this.renderAll();
                alert('Backup restaurado correctamente.');
            },
            // Error callback
            (err) => {
                alert('Error al leer el archivo de backup: ' + err.message);
            }
        );
    }
};

// Exportar para uso global
window.AppManager = AppManager;

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    AppManager.init();
});
