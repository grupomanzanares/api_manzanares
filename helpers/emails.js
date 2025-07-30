import nodemailer from 'nodemailer'

const emailRegister = async (data) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secureConnection: true,
        debug: true,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        },
 
    });

    const {email, name, token} = data

    // Enviar el email
    await transport.sendMail({
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: 'Confirma tu cuenta en Bienes Raices',
        text:'Confirma tu cuenta en Bienes Raices',
        html: `
            <p>Hola, ${name}, comprueba tu cuenta en Sistema de Trazabilidad </p>

            <p>Solo debes confirmar dando click en el siguiente enlace: <a href='${process.env.URL_BACKEND}:${process.env.PORT}/auth/confirm-register/${token}'>Confirmar Cuenta</a></p>

            <p>Si tu no solicitaste Recuperacion de Password, has caso omiso al mensaje.</p>
        `
    })
}

const emailRecoverPassword = async (data) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secureConnection: true,
        debug: true,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false // ⚠ Desactiva la verificación SSL (No recomendado en producción)
        }
    });

    const {email, name, token} = data

    /**  Enviar email */
    await transport.sendMail({
        from:  process.env.EMAIL_USERNAME,
        to: email,
        subject: 'Reestablece tu Contraseña ',
        text:'Reestablece tu password',
        html: `
            <p>Hola, ${name}, Has solicitado reestablecer tu contraseña en sistema de Gestión Ganadería Manzanares</p>

            
            <p>Lo puedes realizar dando click en el siguiente enlace: <a href='${process.env.URL_BACKEND}/auth/reset-password/${token}'>Reestablecer Password </a></p>

            <p>Si tu no creaste esta cuenta, has caso omiso al mensaje.</p>
        `
    })
}



const emailNotAutorizacion = async (data) => {

    const urlBase = 'https://gmanzanares.com.co/api_manzanares/'
    const urlAutorizacion = 'https://gmanzanares.com.co/gestion/main/autorizar'

    console.log ("data recibida para correo", data);
    console.log ("🔍 asignacionAutomatica:", data.asignacionAutomatica);

        const transport = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secureConnection: true,
            debug: true,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false // ⚠ Desactiva la verificación SSL (No recomendado en producción)
            }
        });
    
        const {
            tipo,
            numero,
            valor,
            cufe,
            urlpdf,
            correoSolicitante,
            nombreSolicitante,
            correoResponsable,
            nombreResponsable,
            asignacionAutomatica
        } = data;
    
        /**  Enviar email */
        try {
            // Generar el mensaje condicional
            const mensajeCondicional = asignacionAutomatica 
                ? `<p>El sistema ha encontrado que normalmente autorizas facturas de este proveedor, te agradecemos verifiques y realices el proceso correspondiente o rechaces para que la persona autorizada reasigne la factura</p>`
                : `<p>Este documento fue gestionado por ${nombreSolicitante} (${correoSolicitante}).</p>`;
            
            console.log('🔍 Debug mensaje condicional:', {
                asignacionAutomatica,
                tipoAsignacionAutomatica: typeof asignacionAutomatica,
                mensajeGenerado: asignacionAutomatica ? 'AUTOMATICA' : 'MANUAL'
            });

            // Enviar al responsable
            await transport.sendMail({
                from: process.env.EMAIL_USERNAME,
                to: correoResponsable,
                bcc: 'tics@gmanzanares.com',
                subject: 'Documento para autorización',
                html: `
                    <p>Hola ${nombreResponsable},</p>
                    <p>Se te ha asignado un documento para autorizar:</p>
                    <ul>
                        <li><strong>Tipo:</strong> ${tipo}</li>
                        <li><strong>Número:</strong> ${numero}</li>
                        <li><strong>Valor:</strong> ${valor}</li>
                        <li><strong>CUFE:</strong> ${cufe}</li>
                    </ul>
                    <p>Puedes ver el Pdf de la factura para corroborar datos en el siguiente enlace: <a href="${urlBase}${urlpdf}">Ver documento</a></p>
                    <p>Ingresa al siguiente link para autorizar: <a href="${urlAutorizacion}">Plataforma Gestión</a></p>
                    ${mensajeCondicional}
                    <p>Cordialmente,<br>Grupo Manzanares.</p>
                `
            });
    
            console.log('📧 Correo enviado a responsable:..', correoResponsable);
        } catch (error) {
            console.error('❌ Error enviando correo:', error);
        }
    }



const emailCompraAutorizada = async (data) => {

        const urlBase = 'https://gmanzanares.com.co/api_manzanares/'
 
    
        console.log ("data recibida para correo", data);
    
            const transport = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secureConnection: true,
                debug: true,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                },
                tls: {
                    rejectUnauthorized: false // ⚠ Desactiva la verificación SSL (No recomendado en producción)
                }
            });
        
            const {
                tipo,
                numero,
                valor,
                cufe,
                urlpdf,
                correoSolicitante,
                nombreSolicitante,
                correoResponsable,
                nombreResponsable
            } = data;
        
            /**  Enviar email */
            try {
                // Enviar al responsable
                await transport.sendMail({
                    from: process.env.EMAIL_USERNAME,
                    to: correoResponsable,
                    bcc: 'tics@gmanzanares.com',
                    subject: 'Documento AUTORIZADO',
                    html: `
                        <p>Hola ${nombreResponsable},</p>
                        <p>El siguiente documento fue AUTORIZADO por   <strong>${nombreSolicitante}</strong> </p>
                        <ul>
                            <li><strong>Tipo:</strong> ${tipo}</li>
                            <li><strong>Número:</strong> ${numero}</li>
                            <li><strong>Valor:</strong> ${valor}</li>
                            <li><strong>CUFE:</strong> ${cufe}</li>
                        </ul>
                        <p>Puedes ver el Pdf de la factura  en el siguiente enlace: <a href="${urlBase}${urlpdf}">Ver documento</a></p>
       
                 
                        <p>Cordialmente,<br>Grupo Manzanares.</p>
                    `
                });
        
                console.log('📧 Correo enviado a responsable:..', correoResponsable);
            } catch (error) {
                console.error('❌ Error enviando correo:', error);
            }
        }

        

const emailComprasPorAutorizar = async (data) => {
        const link = 'https://gmanzanares.com.co/gestion/auth'
        console.log ("data recibida para correo", data);
    
            const transport = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secureConnection: true,
                debug: true,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                },
                tls: {
                    rejectUnauthorized: false // ⚠ Desactiva la verificación SSL (No recomendado en producción)
                }
            });
        
            const {
                correoResponsable,
                nombreResponsable,
                CantidadFacturasPendientes
            } = data;
        
            /**  Enviar email */
            try {
                // Enviar al responsable
                await transport.sendMail({
                    from: process.env.EMAIL_USERNAME,
                    to: correoResponsable,
                    bcc: 'tics@gmanzanares.com',
                    subject: 'NOTIFICACIÒN:Documentos Pendientes para autorización..',
                    html: `
                          <p>Hola <b>${nombreResponsable}</b>,</p>
                          <p>Tienes <b>${CantidadFacturasPendientes}</b> documentos pendientes por autorizar</p>
                          <p><a href="${link}"><b>Haz clic aquí para gestionarlas</b></a></p>
                          <br>
                          <p>Cordialmente,<br>Grupo Manzanares</p>
                    `
                });
        
                console.log('📧 Correo enviado a responsable:', correoResponsable);
            } catch (error) {
                console.error('❌ Error enviando correo:', error);
            }
}


const emailRecordatorioComprasPorAutorizar = async (data) => {
    const link = 'https://gmanzanares.com.co/gestion/auth'
    console.log ("data recibida para correo", data);

        const transport = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secureConnection: true,
            debug: true,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false // ⚠ Desactiva la verificación SSL (No recomendado en producción)
            }
        });
    
        const {
            correoResponsable,
            nombreResponsable,
            CantidadFacturasPendientes,
            mensajeEspecial = '' // Nuevo parámetro opcional
        } = data;
    
        /**  Enviar email */
        try {
            // Enviar al responsable
            await transport.sendMail({
                from: process.env.EMAIL_USERNAME,
                to: correoResponsable,
                bcc: 'tics@gmanzanares.com',
                subject: 'NOTIFICACIóN: Documentos Pendientes para autorización..',
                html: `
                      <p>Cordial Saludo, <b>${nombreResponsable}</b>,</p>
                      ${mensajeEspecial ? `<p><strong>${mensajeEspecial}</strong></p>` : ''}
                      <p>Tienes <b>${CantidadFacturasPendientes}</b> documentos pendientes por autorizar.</p>
                      <p><a href="${link}"><b>Haz clic aquí para gestionarlas</b></a></p>
                      <br>
                      <p>Cordialmente,<br>Grupo Manzanares.</p>
                `
            });
    
            console.log('📧 Correo enviado a responsable:', correoResponsable);
        } catch (error) {
            console.error('❌ Error enviando correo:', error);
        }
}

export {
    emailRegister,
    emailRecoverPassword,
    emailNotAutorizacion,
    emailComprasPorAutorizar,
    emailRecordatorioComprasPorAutorizar,
    emailCompraAutorizada
    
}