/**
 * Configuración de denominaciones y constantes
 */

const Config = {
    /**
     * Denominaciones disponibles (billetes y monedas)
     */
    denominations: [5, 10, 20, 50, 100, 200, 500, 1000],

    /**
     * Claves para localStorage
     */
    storageKeys: {
        boxes: 'multi_cash_boxes',
        currentBoxId: 'currentBoxId'
    },

    /**
     * Versión actual del formato de backup
     */
    backupVersion: '1.0'
};

// Exportar para uso global
window.Config = Config;
