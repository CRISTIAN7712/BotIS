const { addKeyword } = require('@bot-whatsapp/bot')
const mysql = require('mysql2/promise');// Import the 'mysql2' library for database operations.
const { MYSQL_DB_HOST, MYSQL_DB_USER, MYSQL_DB_PASSWORD, MYSQL_DB_NAME, MYSQL_DB_PORT } = require('../data'); // Asegúrate de que la ruta sea correcta si el archivo data.js está en un directorio diferente.
const flowInfo = require('./flowInfo')
const flowMenu2 = require('./flowMenu2')
const flowSecundario = require('./flowSecundario')

async function obtenerGrado() {
    // Conecta a la base de datos MySQL
    const connection = await mysql.createConnection({
        host: MYSQL_DB_HOST,
        user: MYSQL_DB_USER,
        password: MYSQL_DB_PASSWORD,
        database: MYSQL_DB_NAME,
        port: MYSQL_DB_PORT,
    });

    try {
        // Ejecuta una consulta SQL para obtener los datos de la tabla 'tesisProgramadas'
        const [rows, fields] = await connection.execute('SELECT * FROM fechagrado');
        return rows;
    } catch (error) {
        console.error(error);
    } finally {
        // Cierra la conexión a la base de datos MySQL
        connection.close();
    }
}

let fallBackGrado = 0
module.exports = addKeyword('##_flow_grado_##')
    .addAnswer('Estas son las fechas de grados:')
    .addAction(async (ctx, { flowDynamic }) => {
        const data = await obtenerGrado();
        if (!data.length) {
            // Si no se encontraron fechas, envía un mensaje informativo
            return flowDynamic('En este momento no hay fechas de grados registradas.');
        }
        let message = '';
        for (let i = 0; i < data.length; i++) {
            const { Fecha, Lugar, Nota } = data[i];
            message += `*Fecha:* ${Fecha} \n*Lugar:* ${Lugar} \n*Último día para socializar:* ${Nota} \n\n`;
        }
        return flowDynamic(message);
    })
    .addAnswer('Elige una opción: 👇🏼')
    .addAnswer(['*1.* Cronogramas 📅📋', '*2.* Menú 📚📌', '*3.* Finalizar 🏁🤓'], { capture: true }, async (ctx, { fallBack, gotoFlow, endFlow }) => {
        if (ctx.body === '1') {
            gotoFlow(flowInfo);
        }
        else if (ctx.body === '2') {
            gotoFlow(flowMenu2);
        }
        else if (ctx.body === '3') {
            gotoFlow(flowSecundario);
        }
        else if (ctx.body !== '1' && ctx.body != '2' && ctx.body != '3') {
            if (fallBackGrado < 3) {
                fallBackGrado++;
                return fallBack('⚠️ *Selecciona una opcion valida* ⚠️ \n\nIngresa *1* para consultar los cronogramas de los semestres, *2* para volver al menú principal o *3* para finalizar *BotIS*');
            } else if (fallBackGrado === 3) {
                return endFlow({ body: '❌ *Opción no válida* ❌ \n\nChat Bot finalizado, nos vemos luego. 👋🤓' });
            }
        }
    })