import 'dotenv/config';
import cron from 'node-cron';
import db from './config/db.js';
import { compraReportada, User } from './modules/gestion/gestionRelations.js';
import { Op } from 'sequelize';
import { emailRecordatorioComprasPorAutorizar } from './helpers/emails.js';

(async () => {
  try {
    await db.authenticate();
    await db.sync();
    console.log('✅ Conectado a la base de datos correctamente.');
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    process.exit(1);
  }
})();

function esDiaHabil(fecha = new Date()) {
  const dia = fecha.getDay();
  return dia !== 0 && dia !== 6;
}

function esPenultimoDiaHabilDelMes(fecha = new Date()) {
  let year = fecha.getFullYear();
  let month = fecha.getMonth();
  let ultimo = new Date(year, month + 1, 0);
  let diasHabiles = [];
  
  console.log(`🔍 Verificando penúltimo día hábil para: ${fecha.toDateString()}`);
  console.log(`📅 Mes: ${month + 1}/${year}, Último día: ${ultimo.toDateString()}`);
  
  // Recorrer desde el último día hacia atrás
  for (let d = new Date(ultimo); d.getMonth() === month; d.setDate(d.getDate() - 1)) {
    if (esDiaHabil(d)) {
      diasHabiles.push(new Date(d));
      console.log(`📅 Día hábil encontrado: ${d.toDateString()}`);
    }
  }
  
  // Ordenar los días hábiles (del último al primero)
  diasHabiles.sort((a, b) => b - a);
  
  console.log(`📊 Total días hábiles del mes: ${diasHabiles.length}`);
  diasHabiles.forEach((dia, index) => {
    console.log(`  ${index + 1}. ${dia.toDateString()}`);
  });
  
  // El penúltimo día hábil es el segundo en la lista (índice 1)
  if (diasHabiles.length >= 2) {
    const penultimoDiaHabil = diasHabiles[1];
    const esPenultimo = fecha.toDateString() === penultimoDiaHabil.toDateString();
    console.log(`🎯 Penúltimo día hábil: ${penultimoDiaHabil.toDateString()}`);
    console.log(`🎯 ¿Es penúltimo? ${esPenultimo ? 'SÍ' : 'NO'}`);
    return esPenultimo;
  }
  
  console.log(`❌ No hay suficientes días hábiles en el mes`);
  return false;
}

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

function esUltimoDiaHabilDelMes(fecha = new Date()) {
  let year = fecha.getFullYear();
  let month = fecha.getMonth();
  let ultimo = new Date(year, month + 1, 0);
  let diasHabiles = [];
  
  console.log(`🔍 Verificando último día hábil para: ${fecha.toDateString()}`);
  console.log(`📅 Mes: ${month + 1}/${year}, Último día: ${ultimo.toDateString()}`);
  
  // Recorrer desde el último día hacia atrás
  for (let d = new Date(ultimo); d.getMonth() === month; d.setDate(d.getDate() - 1)) {
    if (esDiaHabil(d)) {
      diasHabiles.push(new Date(d));
      console.log(`📅 Día hábil encontrado: ${d.toDateString()}`);
    }
  }
  
  // Ordenar los días hábiles (del último al primero)
  diasHabiles.sort((a, b) => b - a);
  
  console.log(`📊 Total días hábiles del mes: ${diasHabiles.length}`);
  diasHabiles.forEach((dia, index) => {
    console.log(`  ${index + 1}. ${dia.toDateString()}`);
  });
  
  // El último día hábil es el primero en la lista (índice 0)
  if (diasHabiles.length >= 1) {
    const ultimoDiaHabil = diasHabiles[0];
    const esUltimo = fecha.toDateString() === ultimoDiaHabil.toDateString();
    console.log(`🎯 Último día hábil: ${ultimoDiaHabil.toDateString()}`);
    console.log(`🎯 ¿Es último? ${esUltimo ? 'SÍ' : 'NO'}`);
    return esUltimo;
  }
  
  console.log(`❌ No hay días hábiles en el mes`);
  return false;
}

async function enviarCorreosProgramados(motivo) {
  console.log(`🚀 Iniciando envío de correos: ${motivo}`);
  
  try {
    // Consulta similar a getComprasPorAutorizar
    const registros = await compraReportada.findAll({
      where: {
        habilitado: true,
        estadoId: 2,
        responsableId: { [Op.ne]: null }
      },
      include: [
        {
          model: User,
          as: 'responsable',
          attributes: ['id', 'name', 'celphone', 'email']
        }
      ]
    });

    console.log(`📊 Total de registros encontrados: ${registros.length}`);

    // Agrupar por responsableId
    const resumen = {};
    registros.forEach(registro => {
      const responsable = registro.responsable;
      if (!responsable) return;
      const key = responsable.id;
      if (!resumen[key]) {
        resumen[key] = {
          name: responsable.name,
          celphone: responsable.celphone,
          email: responsable.email,
          cantidad: 0
        };
      }
      resumen[key].cantidad += 1;
    });

    const resultado = Object.values(resumen);
    console.log(`👥 Total de responsables con pendientes: ${resultado.length}`);

    let correosEnviados = 0;
    for (const responsable of resultado) {
      if (responsable.email) {
        try {
          // Determinar el mensaje especial según el motivo
          let mensajeEspecial = '';
          if (motivo.includes('Penúltimo día hábil')) {
            mensajeEspecial = 'Hoy es penúltimo día hábil del mes, es necesario que todos los documentos queden autorizados antes del cierre del mes.';
          } else if (motivo.includes('Primer día hábil')) {
            mensajeEspecial = 'Hoy es primer día hábil del nuevo mes, necesitamos que todos los documentos del mes anterior queden autorizados y procesados.';
          } else if (motivo.includes('Último día hábil')) {
            mensajeEspecial = 'Hoy es último día hábil del mes, es urgente que todos los documentos queden autorizados antes del cierre del mes.';
          }

          await emailRecordatorioComprasPorAutorizar({
            correoResponsable: responsable.email,
            nombreResponsable: responsable.name,
            CantidadFacturasPendientes: responsable.cantidad,
            mensajeEspecial: mensajeEspecial
          });
          console.log(`✅ Correo enviado a ${responsable.email} - ${responsable.cantidad} pendientes (${motivo})`);
          correosEnviados++;
        } catch (error) {
          console.error(`❌ Error enviando correo a ${responsable.email}:`, error.message);
        }
      } else {
        console.log(`⚠️ Responsable ${responsable.name} no tiene email configurado`);
      }
    }

    console.log(`📧 Resumen: ${correosEnviados} correos enviados de ${resultado.length} responsables (${motivo})`);
    
  } catch (error) {
    console.error('❌ Error en enviarCorreosProgramados:', error);
  }
}

// Ejecutar a las 8:00 am solo si es penúltimo, primer o último día hábil
cron.schedule('0 8 * * *', () => {
  const hoy = new Date();
  console.log(`\n⏰ ===== CRON JOB EJECUTADO =====`);
  console.log(`📅 Fecha actual: ${hoy.toLocaleDateString()}`);
  console.log(`📅 Hora actual: ${hoy.toLocaleTimeString()}`);
  console.log(`📅 Día de la semana: ${hoy.getDay()} (${hoy.getDay() === 0 ? 'Domingo' : hoy.getDay() === 6 ? 'Sábado' : 'Hábil'})`);
  
  console.log(`\n🔍 Verificando si es penúltimo día hábil...`);
  const esPenultimo = esPenultimoDiaHabilDelMes(hoy);
  
  console.log(`\n🔍 Verificando si es primer día hábil...`);
  const esPrimero = esPrimerDiaHabilDelMes(hoy);
  
  console.log(`\n🔍 Verificando si es último día hábil...`);
  const esUltimo = esUltimoDiaHabilDelMes(hoy);
  
  if (esPenultimo) {
    console.log('✅ ES PENÚLTIMO DÍA HÁBIL - Enviando correos...');
    enviarCorreosProgramados('Penúltimo día hábil');
  } else if (esPrimero) {
    console.log('✅ ES PRIMER DÍA HÁBIL - Enviando correos...');
    enviarCorreosProgramados('Primer día hábil');
  } else if (esUltimo) {
    console.log('✅ ES ÚLTIMO DÍA HÁBIL - Enviando correos...');
    enviarCorreosProgramados('Último día hábil');
  } else {
    console.log('❌ No es día especial para envío de correos');
  }
  
  console.log(`⏰ ===== FIN CRON JOB =====\n`);
}); 