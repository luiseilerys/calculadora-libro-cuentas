/**
 * Servicio de backup - Exportar e importar datos
 */

const BackupService = {
    /**
     * Exporta todos los datos a un archivo JSON
     */
    exportBackup(boxes, currentBoxId) {
        const backupData = {
            version: Config.backupVersion,
            fechaExportacion: Utils.getISODate(),
            boxes: boxes.map(b => ({
                id: b.id,
                name: b.name,
                transactions: b.transactions,
                sessions: b.sessions,
                quantities: b.quantities
            })),
            currentBoxId: currentBoxId
        };

        const dataStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `multicajas_backup_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        return true;
    },

    /**
     * Importa datos desde un archivo JSON
     * @param {File} file - Archivo JSON seleccionado
     * @param {Function} onSuccess - Callback con los datos importados
     * @param {Function} onError - Callback con el error
     */
    importBackup(file, onSuccess, onError) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const backupData = JSON.parse(e.target.result);
                
                // Validar estructura del backup
                StorageService.validateBackup(backupData);
                
                onSuccess(backupData);
                
            } catch (err) {
                if (onError) {
                    onError(err);
                } else {
                    console.error('Error al importar backup:', err);
                }
            }
        };
        
        reader.onerror = function() {
            if (onError) {
                onError(new Error('Error al leer el archivo'));
            }
        };
        
        reader.readAsText(file);
    }
};

// Exportar para uso global
window.BackupService = BackupService;
