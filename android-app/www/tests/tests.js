/**
 * Tests unitarios para MultiCajas
 */

// Configurar QUnit
QUnit.module('Utils');

QUnit.test('formatMoney formatea correctamente', function(assert) {
    assert.ok(Utils.formatMoney(1234.56).includes('1,234.56'), 'Incluye el número formateado');
    assert.ok(Utils.formatMoney(0).includes('$0.00'), 'Formatea cero correctamente');
    assert.ok(Utils.formatMoney(-50).includes('-50.00'), 'Formatea negativos correctamente');
});

QUnit.test('escapeHtml previene XSS', function(assert) {
    assert.equal(Utils.escapeHtml('<script>'), '&lt;script&gt;', 'Escapa tags script');
    assert.equal(Utils.escapeHtml('a & b'), 'a &amp; b', 'Escapa ampersand');
    assert.equal(Utils.escapeHtml('test "quote"'), 'test &quot;quote&quot;', 'Escapa comillas dobles');
    assert.equal(Utils.escapeHtml("test 'quote'"), "test &#39;quote&#39;", 'Escapa comillas simples');
    assert.equal(Utils.escapeHtml(null), '', 'Maneja null');
    assert.equal(Utils.escapeHtml(undefined), '', 'Maneja undefined');
});

QUnit.test('generateId genera IDs únicos', function(assert) {
    const id1 = Utils.generateId();
    const id2 = Utils.generateId();
    assert.notEqual(id1, id2, 'Los IDs generados son diferentes');
    assert.ok(typeof id1 === 'number', 'El ID es un número');
});

QUnit.module('CashBox');

QUnit.test('CashBox se inicializa correctamente', function(assert) {
    const box = new CashBox('Test');
    assert.equal(box.name, 'Test', 'Nombre correcto');
    assert.ok(box.id, 'Tiene ID generado');
    assert.equal(box.transactions.length, 0, 'Sin transacciones iniciales');
    assert.equal(box.sessions.length, 0, 'Sin sesiones iniciales');
    
    // Verificar denominaciones inicializadas
    Config.denominations.forEach(d => {
        assert.equal(box.quantities[d], 0, `Denominación ${d} inicializada en 0`);
    });
});

QUnit.test('CashBox.addTransaction funciona correctamente', function(assert) {
    const box = new CashBox('Test');
    
    // Transacción válida
    const result = box.addTransaction('Sueldo', 1000, 'ingreso');
    assert.true(result, 'Retorna true para transacción válida');
    assert.equal(box.transactions.length, 1, 'Una transacción agregada');
    assert.equal(box.transactions[0].concepto, 'Sueldo', 'Concepto correcto');
    assert.equal(box.transactions[0].monto, 1000, 'Monto correcto');
    assert.equal(box.transactions[0].tipo, 'ingreso', 'Tipo correcto');
    
    // Transacción inválida (monto negativo)
    const result2 = box.addTransaction('Invalid', -50, 'gasto');
    assert.false(result2, 'Retorna false para monto negativo');
    
    // Transacción con concepto vacío
    box.addTransaction('', 500, 'ingreso');
    assert.equal(box.transactions[1].concepto, 'Ingreso', 'Concepto por defecto para ingreso');
});

QUnit.test('CashBox.updateTransaction funciona correctamente', function(assert) {
    const box = new CashBox('Test');
    box.addTransaction('Original', 100, 'ingreso');
    const id = box.transactions[0].id;
    
    // Actualización válida
    const result = box.updateTransaction(id, 'Actualizado', 200, 'gasto');
    assert.true(result, 'Retorna true para actualización válida');
    assert.equal(box.transactions[0].concepto, 'Actualizado', 'Concepto actualizado');
    assert.equal(box.transactions[0].monto, 200, 'Monto actualizado');
    assert.equal(box.transactions[0].tipo, 'gasto', 'Tipo actualizado');
    
    // Actualización inválida (ID no existe)
    const result2 = box.updateTransaction(999, 'X', 10, 'ingreso');
    assert.false(result2, 'Retorna false para ID inexistente');
});

QUnit.test('CashBox.deleteTransaction funciona correctamente', function(assert) {
    const box = new CashBox('Test');
    box.addTransaction('Tx1', 100, 'ingreso');
    box.addTransaction('Tx2', 50, 'gasto');
    const id = box.transactions[0].id;
    
    const result = box.deleteTransaction(id);
    assert.true(result, 'Retorna true al eliminar');
    assert.equal(box.transactions.length, 1, 'Una transacción restante');
    assert.equal(box.transactions[0].concepto, 'Tx2', 'Transacción correcta restante');
    
    // Eliminar ID inexistente
    const result2 = box.deleteTransaction(999);
    assert.false(result2, 'Retorna false para ID inexistente');
});

QUnit.test('CashBox.getBalance calcula correctamente', function(assert) {
    const box = new CashBox('Test');
    box.addTransaction('Ingreso 1', 500, 'ingreso');
    box.addTransaction('Gasto 1', 200, 'gasto');
    box.addTransaction('Ingreso 2', 300, 'ingreso');
    
    const balance = box.getBalance();
    assert.equal(balance, 600, 'Balance correcto (500 - 200 + 300 = 600)');
});

QUnit.module('ChangeCalculator');

QUnit.test('calcularVueltoExacto - caso básico', function(assert) {
    const res = ChangeCalculator.calcularVueltoExacto(150, 200);
    assert.equal(res.vuelto, 50, 'Vuelto correcto');
    assert.deepEqual(res.cambio, {50: 1}, 'Cambio correcto');
});

QUnit.test('calcularVueltoExacto - múltiples denominaciones', function(assert) {
    const res = ChangeCalculator.calcularVueltoExacto(30, 100);
    assert.equal(res.vuelto, 70, 'Vuelto correcto');
    assert.deepEqual(res.cambio, {50: 1, 20: 1}, 'Cambio con múltiples denominaciones');
});

QUnit.test('calcularVueltoExacto - efectivo insuficiente', function(assert) {
    const res = ChangeCalculator.calcularVueltoExacto(100, 50);
    assert.equal(res.error, 'Insuficiente', 'Error de insuficiente');
});

QUnit.test('calcularVueltoExacto - no exacto', function(assert) {
    const res = ChangeCalculator.calcularVueltoExacto(99.99, 100);
    assert.equal(res.error, 'No exacto', 'Error de no exacto');
    assert.ok(res.resto > 0, 'Tiene resto');
});

QUnit.test('calcularVueltoExacto - sin vuelto', function(assert) {
    const res = ChangeCalculator.calcularVueltoExacto(100, 100);
    assert.equal(res.vuelto, 0, 'Vuelto cero');
    assert.deepEqual(res.cambio, {}, 'Sin cambio');
});

QUnit.module('Integration');

QUnit.test('Flujo completo: crear caja, agregar transacción, verificar balance', function(assert) {
    const box = new CashBox('Integration Test');
    
    // Agregar transacciones
    box.addTransaction('Saldo inicial', 1000, 'ingreso');
    box.addTransaction('Compra', 300, 'gasto');
    box.addTransaction('Venta', 500, 'ingreso');
    
    // Verificar balance
    assert.equal(box.getBalance(), 1200, 'Balance correcto después de operaciones');
    
    // Verificar número de transacciones
    assert.equal(box.transactions.length, 3, 'Tres transacciones registradas');
    
    // Verificar ordenamiento
    const sorted = box.getSortedTransactions();
    assert.ok(
        new Date(sorted[0].fechaISO) >= new Date(sorted[1].fechaISO),
        'Transacciones ordenadas por fecha descendente'
    );
});

QUnit.test('Flujo completo: calculadora de vuelto con denominaciones reales', function(assert) {
    const totalPagar = 127;
    const entregado = 200;
    const res = ChangeCalculator.calcularVueltoExacto(totalPagar, entregado, Config.denominations);
    
    assert.equal(res.vuelto, 73, 'Vuelto calculado correctamente');
    
    // Verificar que el cambio suma el vuelto correcto
    let cambioTotal = 0;
    for (let [den, qty] of Object.entries(res.cambio)) {
        cambioTotal += den * qty;
    }
    assert.equal(cambioTotal, res.vuelto, 'La suma del cambio iguala el vuelto');
});
