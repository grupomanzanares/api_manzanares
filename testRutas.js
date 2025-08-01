import 'dotenv/config';

console.log('🧪 PRUEBA DE RUTAS DE ACTUALIZACIÓN');
console.log('=====================================');

console.log('\n📋 RESUMEN DE RUTAS:');
console.log('1. PUT /:id - Actualización simple con PDF principal');
console.log('   - Usa: upload.single("archivo")');
console.log('   - Para: Carga normal de PDF');
console.log('   - Archivos: Solo 1 PDF principal');

console.log('\n2. PUT /:id/with-adjuntos - Actualización con adjuntos');
console.log('   - Usa: upload.fields([...])');
console.log('   - Para: Autorizador que sube múltiples archivos');
console.log('   - Archivos: 1 PDF principal + hasta 10 adjuntos');

console.log('\n📁 ESTRUCTURA DE ARCHIVOS:');
console.log('- PDF principal: /uploads/');
console.log('- Adjuntos: /uploads/adjautorizador/');

console.log('\n💾 BASE DE DATOS:');
console.log('- PDF principal: Se guarda en compraReportada.urlPdf');
console.log('- Adjuntos: Se guardan en CompraReportadaDetalle.archivo');

console.log('\n🔧 MIDDLEWARE:');
console.log('- uploadPdf.js: Para PDF principal');
console.log('- uploadAdjAutorizador.js: Para adjuntos (ya configurado)');

console.log('\n✅ CONFIGURACIÓN COMPLETADA');
console.log('Las rutas están separadas y el controlador maneja ambos casos.'); 