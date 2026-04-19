/**
 * Tests unitarios para MultiCajas
 * Tests actualizados para precisión monetaria con enteros (centavos)
 */

// Configurar QUnit
QUnit.module('Utils');

QUnit.test('dollarsToCents convierte correctamente', function(assert) {
    assert.equal(Utils.dollarsToCents(10.50), 1050, '10.50 dólares = 1050 centavos');
    assert.equal(Utils.dollarsToCents(0.99), 99, '0.99 dólares = 99 centavos');
    assert.equal(Utils.dollarsToCents(100), 10000, '100 dólares = 10000 centavos');
    assert.equal(Utils.dollarsToCents(0.01), 1, '0.01 dólares = 1 centavo');
});

QUnit.test('centsToDollars convierte correctamente', function(assert) {
    assert.equal(Utils.centsToDollars(1050), 10.50, '1050 centavos = 10.50 dólares');
    assert.equal(Utils.centsToDollars(99), 0.99, '99 centavos = 0.99 dólares');
    assert.equal(Utils.centsToDollars(10000), 100, '10000 centavos = 100 dólares');
    assert.equal(Utils.centsToDollars(1), 0.01, '1 centavo = 0.01 dólares');
});

QUnit.test('formatMoney formatea correctamente dólares', function(assert) {
    assert.ok(Utils.formatMoney(1234.56).includes('1,234.56'), 'Incluye el número formateado');
    assert.ok(Utils.formatMoney(0).includes('$0.00'), 'Formatea cero correctamente');
    assert.ok(Utils.formatMoney(-50).includes('-50.00'), 'Formatea negativos correctamente');
});

QUnit.test('formatMoney formatea correctamente centavos', function(assert) {
    assert.ok(Utils.formatMoney(123456, true).includes('1,234.56'), 'Incluye el número formateado desde centavos');
    assert.ok(Utils.formatMoney(0, true).includes('$0.00'), 'Formatea cero correctamente desde centavos');
    assert.ok(Utils.formatMoney(1050, true).includes('10.50'), 'Formatea 1050 centavos como $10.50');
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

QUnit.test('CashBox.addTransaction funciona correctamente con precisión monetaria', function(assert) {
    const box = new CashBox('Test');
    
    // Transacción válida
    const result = box.addTransaction('Sueldo', 1000.50, 'ingreso');
    assert.true(result, 'Retorna true para transacción válida');
    assert.equal(box.transactions.length, 1, 'Una transacción agregada');
    assert.equal(box.transactions[0].concepto, 'Sueldo', 'Concepto correcto');
    assert.equal(box.transactions[0].monto, 1000.50, 'Monto en dólares correcto');
    assert.equal(box.transactions[0].montoCents, 100050, 'Monto en centavos correcto (evita errores de float)');
    assert.equal(box.transactions[0].tipo, 'ingreso', 'Tipo correcto');
    
    // Transacción inválida (monto negativo)
    const result2 = box.addTransaction('Invalid', -50, 'gasto');
    assert.false(result2, 'Retorna false para monto negativo');
    
    // Transacción con concepto vacío
    box.addTransaction('', 500, 'ingreso');
    assert.equal(box.transactions[1].concepto, 'Ingreso', 'Concepto por defecto para ingreso');
});

QUnit.test('CashBox.updateTransaction mantiene precisión monetaria', function(assert) {
    const box = new CashBox('Test');
    box.addTransaction('Original', 100.50, 'ingreso');
    const id = box.transactions[0].id;
    
    // Actualización válida
    const result = box.updateTransaction(id, 'Actualizado', 200.75, 'gasto');
    assert.true(result, 'Retorna true para actualización válida');
    assert.equal(box.transactions[0].concepto, 'Actualizado', 'Concepto actualizado');
    assert.equal(box.transactions[0].monto, 200.75, 'Monto en dólares actualizado');
    assert.equal(box.transactions[0].montoCents, 20075, 'Monto en centavos actualizado correctamente');
    assert.equal(box.transactions[0].tipo, 'gasto', 'Tipo actualizado');
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

QUnit.test('CashBox.getBalance calcula correctamente usando enteros', function(assert) {
    const box = new CashBox('Test');
    box.addTransaction('Ingreso 1', 500.25, 'ingreso');
    box.addTransaction('Gasto 1', 200.10, 'gasto');
    box.addTransaction('Ingreso 2', 300.00, 'ingreso');
    
    const balance = box.getBalance();
    // 500.25 - 200.10 + 300.00 = 600.15
    assert.equal(balance, 600.15, 'Balance correcto sin errores de punto flotante');
    
    // Verificar que el cálculo interno usa centavos
    const balanceCents = box.getBalanceCents();
    assert.equal(balanceCents, 60015, 'Balance en centavos correcto (entero)');
});

QUnit.module('ChangeCalculator');

QUnit.test('calcularVueltoExacto - caso básico con precisión', function(assert) {
    const res = ChangeCalculator.calcularVueltoExacto(150.50, 200.00);
    assert.equal(res.vuelto, 49.50, 'Vuelto correcto en dólares');
    assert.equal(res.vueltoCents, 4950, 'Vuelto correcto en centavos (entero)');
    assert.deepEqual(res.cambio, {20: 2, 5: 1, 2: 2}, 'Cambio correcto');
});

QUnit.test('calcularVueltoExacto - múltiples denominaciones', function(assert) {
    const res = ChangeCalculator.calcularVueltoExacto(30.25, 100.00);
    assert.equal(res.vuelto, 69.75, 'Vuelto correcto');
    assert.equal(res.vueltoCents, 6975, 'Vuelto en centavos correcto');
    // 50 + 10 + 5 + 2 + 2 + 0.50 + 0.25 = 69.75
    assert.ok(res.cambio[50] === 1, 'Incluye billete de 50');
    assert.ok(res.cambio[10] === 1, 'Incluye billete de 10');
    assert.ok(res.cambio[5] === 1, 'Incluye billete de 5');
    assert.ok(res.cambio[2] === 2, 'Incluye 2 monedas de 2');
});

QUnit.test('calcularVueltoExacto - efectivo insuficiente', function(assert) {
    const res = ChangeCalculator.calcularVueltoExacto(100, 50);
    assert.equal(res.error, 'Insuficiente', 'Error de insuficiente');
});

QUnit.test('calcularVueltoExacto - no exacto', function(assert) {
    const res = ChangeCalculator.calcularVueltoExacto(99.99, 100);
    assert.equal(res.error, 'No exacto', 'Error de no exacto');
    assert.ok(res.resto > 0, 'Tiene resto');
    assert.ok(res.restoCents > 0, 'Tiene resto en centavos (entero)');
});

QUnit.test('calcularVueltoExacto - sin vuelto', function(assert) {
    const res = ChangeCalculator.calcularVueltoExacto(100, 100);
    assert.equal(res.vuelto, 0, 'Vuelto cero');
    assert.equal(res.vueltoCents, 0, 'Vuelto cero en centavos');
    assert.deepEqual(res.cambio, {}, 'Sin cambio');
});

QUnit.test('calcularVueltoExacto - evita errores de punto flotante', function(assert) {
    // Este test verifica que no hay errores de precisión con valores como 0.1 + 0.2
    const res = ChangeCalculator.calcularVueltoExacto(0.10, 0.30);
    assert.equal(res.vuelto, 0.20, 'Vuelto correcto sin errores de float');
    assert.equal(res.vueltoCents, 20, 'Vuelto en centavos es entero exacto');
    assert.deepEqual(res.cambio, {0.20: 1}, 'Cambio correcto');
});

QUnit.module('Integration');

QUnit.test('Flujo completo: crear caja, agregar transacción, verificar balance sin errores float', function(assert) {
    const box = new CashBox('Integration Test');
    
    // Agregar transacciones con decimales problemáticos
    box.addTransaction('Saldo inicial', 1000.10, 'ingreso');
    box.addTransaction('Compra', 300.05, 'gasto');
    box.addTransaction('Venta', 500.15, 'ingreso');
    
    // Verificar balance (1000.10 - 300.05 + 500.15 = 1200.20)
    const balance = box.getBalance();
    assert.equal(balance, 1200.20, 'Balance correcto sin errores de punto flotante');
    
    // Verificar número de transacciones
    assert.equal(box.transactions.length, 3, 'Tres transacciones registradas');
    
    // Verificar que los montos en centavos son exactos
    assert.equal(box.transactions[0].montoCents, 100010, 'Primera transacción en centavos exacta');
    assert.equal(box.transactions[1].montoCents, 30005, 'Segunda transacción en centavos exacta');
    assert.equal(box.transactions[2].montoCents, 50015, 'Tercera transacción en centavos exacta');
    
    // Verificar ordenamiento
    const sorted = box.getSortedTransactions();
    assert.ok(
        new Date(sorted[0].fechaISO) >= new Date(sorted[1].fechaISO),
        'Transacciones ordenadas por fecha descendente'
    );
});

QUnit.test('Flujo completo: calculadora de vuelto con denominaciones reales y precisión', function(assert) {
    const totalPagar = 127.35;
    const entregado = 200.00;
    const res = ChangeCalculator.calcularVueltoExacto(totalPagar, entregado, Config.denominations);
    
    assert.equal(res.vuelto, 72.65, 'Vuelto calculado correctamente');
    assert.equal(res.vueltoCents, 7265, 'Vuelto en centavos es entero exacto');
    
    // Verificar que el cambio suma el vuelto correcto usando centavos
    let cambioTotalCents = 0;
    for (let [den, qty] of Object.entries(res.cambio)) {
        cambioTotalCents += Utils.dollarsToCents(parseFloat(den)) * qty;
    }
    assert.equal(cambioTotalCents, res.vueltoCents, 'La suma del cambio en centavos iguala el vuelto');
});

QUnit.test('CalculatorUI: cálculo de total con enteros evita errores float', function(assert) {
    // Simular una caja con cantidades
    const box = new CashBox('Test Calculator');
    box.quantities[100] = 2;  // 200.00
    box.quantities[50] = 3;   // 150.00
    box.quantities[20] = 5;   // 100.00
    
    let expectedCents = 0;
    for (let d of Config.denominations) {
        expectedCents += Utils.dollarsToCents(d) * (box.quantities[d] || 0);
    }
    
    assert.equal(expectedCents, 45000, 'Total en centavos calculado correctamente (450.00)');
    assert.equal(Utils.centsToDollars(expectedCents), 450, 'Conversión a dólares correcta');
});

QUnit.test('Precisión monetaria: operaciones acumulativas', function(assert) {
    const box = new CashBox('Precision Test');
    
    // Agregar muchas transacciones pequeñas para acumular error potencial
    for (let i = 0; i < 100; i++) {
        box.addTransaction(`Transacción ${i}`, 0.10, 'ingreso');
    }
    
    const balance = box.getBalance();
    const balanceCents = box.getBalanceCents();
    
    // 100 * 0.10 = 10.00 exactamente
    assert.equal(balance, 10, 'Balance exacto sin errores de float acumulados');
    assert.equal(balanceCents, 1000, 'Balance en centavos es entero exacto');
});
