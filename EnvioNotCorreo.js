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
  for (const responsable of resultado) {
    if (responsable.email) {
      await emailRecordatorioComprasPorAutorizar({
        correoResponsable: responsable.email,
        nombreResponsable: responsable.name,
        CantidadFacturasPendientes: responsable.cantidad
      });
      console.log(`Correo enviado a ${responsable.email} (${motivo})`);
    }
  }
}

// Jueves a las 11:00 am
cron.schedule('0 11 * * 4', () => {
  console.log('⏰ Jueves 11:00 am: Enviando correos programados...');
  enviarCorreosProgramados('Jueves 11am');
});

// Todos los días a las 8:00 am, pero solo ejecuta si es penúltimo día hábil
cron.schedule('0 8 * * *', () => {
  const hoy = new Date();
  if (esPenultimoDiaHabilDelMes(hoy)) {
    console.log('⏰ Penúltimo día hábil del mes (8:00 am): Enviando correos programados...');
    enviarCorreosProgramados('Penúltimo día hábil');
  }
});

// Todos los días a las 8:00 am, pero solo ejecuta si es primer día hábil..
cron.schedule('0 8 * * *', () => {
  const hoy = new Date();
  if (esPrimerDiaHabilDelMes(hoy)) {
    console.log('⏰ Primer día hábil del mes (8:00 am): Enviando correos programados...');
    enviarCorreosProgramados('Primer día hábil');
  }
}); 