import 'dotenv/config';
import db from './config/db.js';
import compraReportada from './modules/gestion/CompraReportada/compraReportada.js';
import User from './auth/models/User.js';
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

async function testEnvioCorreos() {
  console.log('🧪 Iniciando prueba de envío de correos...');
  
  try {
    // Conectar a la base de datos
    await db.authenticate();
    console.log('✅ Conectado a la base de datos correctamente.');

    const hoy = new Date();
    console.log(`📅 Fecha actual: ${hoy.toLocaleDateString()}`);
    console.log(`📅 Es penúltimo día hábil: ${esPenultimoDiaHabilDelMes(hoy)}`);

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

    // Preguntar si quiere enviar correos
    console.log('\n¿Desea enviar los correos? (s/n)');
    // En un entorno real, aquí podrías usar readline para input
    // Por ahora, vamos a simular que sí
    
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
    console.log('✅ Prueba completada');
    
  } catch (error) {
    console.error('❌ Error en testEnvioCorreos:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar la prueba
testEnvioCorreos(); 