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

async function enviarCorreosProgramados(motivo) {
  console.log(`🚀 Iniciando envío de correos: ${motivo}`);
  
  try {
    // Consulta para obtener compras pendientes por autorizar
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

    if (resultado.length === 0) {
      console.log('ℹ️ No hay responsables con documentos pendientes por autorizar');
      return;
    }

    // Mostrar información de los responsables
    resultado.forEach((responsable, index) => {
      console.log(`${index + 1}. ${responsable.name} (${responsable.email}) - ${responsable.cantidad} pendientes`);
    });

    let correosEnviados = 0;
    for (const responsable of resultado) {
      if (responsable.email) {
        try {
          console.log(`📧 Enviando correo a ${responsable.email}...`);
          await emailRecordatorioComprasPorAutorizar({
            correoResponsable: responsable.email,
            nombreResponsable: responsable.name,
            CantidadFacturasPendientes: responsable.cantidad
          });
          console.log(`✅ Correo enviado exitosamente a ${responsable.email} - ${responsable.cantidad} pendientes`);
          correosEnviados++;
        } catch (error) {
          console.error(`❌ Error enviando correo a ${responsable.email}:`, error.message);
        }
      } else {
        console.log(`⚠️ Responsable ${responsable.name} no tiene email configurado`);
      }
    }

    console.log(`\n📧 Resumen: ${correosEnviados} correos enviados de ${resultado.length} responsables`);
    
  } catch (error) {
    console.error('❌ Error en enviarCorreosProgramados:', error);
  }
}

// Función principal de prueba
async function testCronLogic() {
  try {
    // Conectar a la base de datos
    await db.authenticate();
    console.log('✅ Conectado a la base de datos correctamente.');

    const hoy = new Date();
    console.log(`\n⏰ ===== PRUEBA DE LÓGICA CRON =====`);
    console.log(`📅 Fecha actual: ${hoy.toLocaleDateString()}`);
    console.log(`📅 Hora actual: ${hoy.toLocaleTimeString()}`);
    console.log(`📅 Día de la semana: ${hoy.getDay()} (${hoy.getDay() === 0 ? 'Domingo' : hoy.getDay() === 6 ? 'Sábado' : 'Hábil'})`);
    
    console.log(`\n🔍 Verificando si es penúltimo día hábil...`);
    const esPenultimo = esPenultimoDiaHabilDelMes(hoy);
    
    console.log(`\n🔍 Verificando si es primer día hábil...`);
    const esPrimero = esPrimerDiaHabilDelMes(hoy);
    
    if (esPenultimo) {
      console.log('✅ ES PENÚLTIMO DÍA HÁBIL - Ejecutando envío de correos...');
      await enviarCorreosProgramados('Penúltimo día hábil');
    } else if (esPrimero) {
      console.log('✅ ES PRIMER DÍA HÁBIL - Ejecutando envío de correos...');
      await enviarCorreosProgramados('Primer día hábil');
    } else {
      console.log('❌ No es día especial para envío de correos');
    }
    
    console.log(`⏰ ===== FIN PRUEBA =====\n`);
    
  } catch (error) {
    console.error('❌ Error en testCronLogic:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar la prueba
testCronLogic(); 