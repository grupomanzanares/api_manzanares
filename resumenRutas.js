console.log('📋 RESUMEN DE RUTAS DE ACTUALIZACIÓN');
console.log('=====================================');

console.log('\n1️⃣ RUTA PARA USUARIO NORMAL:');
console.log('   PUT /:id');
console.log('   - Middleware: upload.single("archivo")');
console.log('   - Función: Sube PDF principal');
console.log('   - Controlador: Guarda en compraReportada.urlPdf');
console.log('   - Archivos: Solo 1 PDF');

console.log('\n2️⃣ RUTA PARA AUTORIZADOR:');
console.log('   PUT /:id/autorizar');
console.log('   - Middleware: uploadAdjAutorizador.array("adjuntos", 10)');
console.log('   - Función: Sube múltiples adjuntos');
console.log('   - Controlador: NO maneja adjuntos (solo el middleware)');
console.log('   - Archivos: Hasta 10 adjuntos (PDF, JPG, PNG, XLSX, XLS)');

console.log('\n📁 ESTRUCTURA DE ARCHIVOS:');
console.log('   - PDF principal: /uploads/');
console.log('   - Adjuntos: /uploads/adjautorizador/');

console.log('\n💾 BASE DE DATOS:');
console.log('   - PDF principal: compraReportada.urlPdf');
console.log('   - Adjuntos: Se guardan automáticamente por el middleware');

console.log('\n✅ CONFIGURACIÓN:');
console.log('   - Controlador simplificado');
console.log('   - Middleware maneja la subida de archivos');
console.log('   - Rutas separadas sin conflictos'); 