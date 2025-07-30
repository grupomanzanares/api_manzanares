import 'dotenv/config';
import cron from 'node-cron';
import db from './config/db.js';
import compraReportada from './modules/gestion/CompraReportada/compraReportada.js';
import User from './auth/models/User.js';
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
  let contador = 0;
  for (let d = ultimo; d.getMonth() === month; d.setDate(d.getDate() - 1)) {
    if (esDiaHabil(d)) {
      contador++;
      if (contador === 2) {
        return fecha.toDateString() === d.toDateString();
      }
    }
  }
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
          await emailRecordatorioComprasPorAutorizar({
            correoResponsable: responsable.email,
            nombreResponsable: responsable.name,
            CantidadFacturasPendientes: responsable.cantidad
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

// Ejecutar a las 11:15 am solo si es penúltimo o primer día hábil
cron.schedule('20 11 * * *', () => {
  const hoy = new Date();
  console.log(`📅 Verificando fecha: ${hoy.toLocaleDateString()}`);
  
  if (esPenultimoDiaHabilDelMes(hoy)) {
    console.log('⏰ Penúltimo día hábil del mes (11:15 am): Enviando correos programados...');
    enviarCorreosProgramados('Penúltimo día hábil');
  } else if (esPrimerDiaHabilDelMes(hoy)) {
    console.log('⏰ Primer día hábil del mes (11:15 am): Enviando correos programados...');
    enviarCorreosProgramados('Primer día hábil');
  } else {
    console.log('📅 No es día especial para envío de correos');
  }
}); 