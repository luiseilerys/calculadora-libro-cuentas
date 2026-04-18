/**
 * Servicio de almacenamiento y persistencia
 */

const StorageService = {
    /**
     * Guarda todas las cajas y el estado actual en localStorage
     */
    saveBoxes(boxes, currentBoxId) {
        const dataToSave = boxes.map(b => ({
            id: b.id,
            name: b.name,
            transactions: b.transactions,
            sessions: b.sessions,
            quantities: b.quantities
        }));
        
        localStorage.setItem(Config.storageKeys.boxes, JSON.stringify(dataToSave));
        localStorage.setItem(Config.storageKeys.currentBoxId, currentBoxId);
    },

    /**
     * Carga las cajas desde localStorage
     * @returns {Object} Objeto con boxes array y currentBoxId
     */
    loadBoxes() {
        const stored = localStorage.getItem(Config.storageKeys.boxes);
        
        if (stored) {
            const parsed = JSON.parse(stored);
            const boxes = parsed.map(b => {
                const box = new CashBox(b.name, b.id);
                box.transactions = b.transactions || [];
                box.sessions = b.sessions || [];
                box.quantities = b.quantities || {};
                
                // Asegurar que todas las denominaciones existan
                Config.denominations.forEach(d => {
                    if (box.quantities[d] === undefined) {
                        box.quantities[d] = 0;
                    }
                });
                
                return box;
            });

            let currentBoxId = localStorage.getItem(Config.storageKeys.currentBoxId);
            
            // Validar que la caja actual exista
            if (!boxes.find(b => b.id == currentBoxId)) {
                currentBoxId = boxes[0]?.id || null;
            }

            return { boxes, currentBoxId };
        } else {
            // Crear caja por defecto si no hay datos
            const defaultBox = new CashBox('Personal');
            defaultBox.addTransaction('Saldo inicial', 500, 'ingreso');
            
            return { 
                boxes: [defaultBox], 
                currentBoxId: defaultBox.id 
            };
        }
    },

    /**
     * Valida un archivo de backup antes de importarlo
     */
    validateBackup(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('El archivo no es un objeto válido');
        }

        if (!data.boxes || !Array.isArray(data.boxes)) {
            throw new Error('Formato inválido: falta el array de cajas');
        }

        // Validar estructura de cada caja
        for (let i = 0; i < data.boxes.length; i++) {
            const box = data.boxes[i];
            if (!box.name || typeof box.name !== 'string') {
                throw new Error(`Caja ${i + 1}: nombre inválido`);
            }
            if (box.transactions && !Array.isArray(box.transactions)) {
                throw new Error(`Caja ${i + 1}: transacciones inválidas`);
            }
            if (box.sessions && !Array.isArray(box.sessions)) {
                throw new Error(`Caja ${i + 1}: sesiones inválidas`);
            }
        }

        return true;
    }
};

// Exportar para uso global
window.StorageService = StorageService;
