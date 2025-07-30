import 'dotenv/config';
import db from './config/db.js';
import { compraReportada, User } from './modules/gestion/gestionRelations.js';
import { Op } from 'sequelize';
import { emailRecordatorioComprasPorAutorizar } from './helpers/emails.js';

// Función para verificar si es día hábil
function esDiaHabil(fecha = new Date()) {
  const dia = fecha.getDay();
  return dia !== 0 && dia !== 6;
}

// Función para verificar si es penúltimo día hábil del mes
function esPenultimoDiaHabilDelMes(fecha = new Date()) {
  let year = fecha.getFullYear();
  let month = fecha.getMonth();
  let ultimo = new Date(year, month + 1, 0);
  let diasHabiles = [];
  
  // Recorrer desde el último día hacia atrás
  for (let d = new Date(ultimo); d.getMonth() === month; d.setDate(d.getDate() - 1)) {
    if (esDiaHabil(d)) {
      diasHabiles.push(new Date(d));
    }
  }
  
  // Ordenar los días hábiles (del último al primero)
  diasHabiles.sort((a, b) => b - a);
  
  // El penúltimo día hábil es el segundo en la lista (índice 1)
  if (diasHabiles.length >= 2) {
    const penultimoDiaHabil = diasHabiles[1];
    return fecha.toDateString() === penultimoDiaHabil.toDateString();
  }
  
  return false;
}

// Función para verificar si es primer día hábil del mes
function esPrimerDiaHabilDelMes(fecha = new Date()) {
  let year = fecha.getFullYear();
  let month = fecha.getMonth();
  for (let d = new Date(year, month, 1); d.getMonth() === month; d.setDate(d.getDate() + 1)) {
    if (esDiaHabil(d)) {
      return fecha.toDateString() === d.toDateString();
    }
  }
  return false;
}

// Función para verificar si es último día hábil del mes
function esUltimoDiaHabilDelMes(fecha = new Date()) {
  let year = fecha.getFullYear();
  let month = fecha.getMonth();
  let ultimo = new Date(year, month + 1, 0);
  let diasHabiles = [];
  
  // Recorrer desde el último día hacia atrás
  for (let d = new Date(ultimo); d.getMonth() === month; d.setDate(d.getDate() - 1)) {
    if (esDiaHabil(d)) {
      diasHabiles.push(new Date(d));
    }
  }
  
  // Ordenar los días hábiles (del último al primero)
  diasHabiles.sort((a, b) => b - a);
  
  // El último día hábil es el primero en la lista (índice 0)
  if (diasHabiles.length >= 1) {
    const ultimoDiaHabil = diasHabiles[0];
    return fecha.toDateString() === ultimoDiaHabil.toDateString();
  }
  
  return false;
}

async function testUltimoDia() {
  try {
    // Conectar a la base de datos
    await db.authenticate();
    console.log('✅ Conectado a la base de datos correctamente.');

    const hoy = new Date();
    console.log(`\n⏰ ===== PRUEBA DE DETECCIÓN DE DÍAS ESPECIALES =====`);
    console.log(`📅 Fecha actual: ${hoy.toLocaleDateString()}`);
    console.log(`📅 Hora actual: ${hoy.toLocaleTimeString()}`);
    console.log(`📅 Día de la semana: ${hoy.getDay()} (${hoy.getDay() === 0 ? 'Domingo' : hoy.getDay() === 6 ? 'Sábado' : 'Hábil'})`);
    
    console.log(`\n🔍 Verificando si es penúltimo día hábil...`);
    const esPenultimo = esPenultimoDiaHabilDelMes(hoy);
    console.log(`🎯 ¿Es penúltimo día hábil? ${esPenultimo ? 'SÍ' : 'NO'}`);
    
    console.log(`\n🔍 Verificando si es primer día hábil...`);
    const esPrimero = esPrimerDiaHabilDelMes(hoy);
    console.log(`🎯 ¿Es primer día hábil? ${esPrimero ? 'SÍ' : 'NO'}`);
    
    console.log(`\n🔍 Verificando si es último día hábil...`);
    const esUltimo = esUltimoDiaHabilDelMes(hoy);
    console.log(`🎯 ¿Es último día hábil? ${esUltimo ? 'SÍ' : 'NO'}`);
    
    // Mostrar todos los días hábiles del mes actual
    console.log(`\n📅 Todos los días hábiles del mes actual:`);
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    let diasHabiles = [];
    
    for (let d = new Date(primerDia); d <= ultimoDia; d.setDate(d.getDate() + 1)) {
      if (esDiaHabil(d)) {
        diasHabiles.push(new Date(d));
      }
    }
    
    diasHabiles.forEach((dia, index) => {
      const esPenultimoDia = index === diasHabiles.length - 2;
      const esUltimoDia = index === diasHabiles.length - 1;
      const esPrimerDia = index === 0;
      
      let etiqueta = '';
      if (esPrimerDia) etiqueta = ' ← PRIMER';
      else if (esPenultimoDia) etiqueta = ' ← PENÚLTIMO';
      else if (esUltimoDia) etiqueta = ' ← ÚLTIMO';
      
      console.log(`${index + 1}. ${dia.toDateString()}${etiqueta}`);
    });
    
    console.log(`\n⏰ ===== FIN PRUEBA =====\n`);
    
  } catch (error) {
    console.error('❌ Error en testUltimoDia:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar la prueba
testUltimoDia(); 