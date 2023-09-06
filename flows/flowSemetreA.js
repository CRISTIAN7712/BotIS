const { addKeyword } = require('@bot-whatsapp/bot')
const mysql = require('mysql2/promise');// Import the 'mysql2' library for database operations.
const { MYSQL_DB_HOST, MYSQL_DB_USER, MYSQL_DB_PASSWORD, MYSQL_DB_NAME, MYSQL_DB_PORT } = require('../data'); // Asegúrate de que la ruta sea correcta si el archivo data.js está en un directorio diferente.
const flowInfo = require('./flowInfo')
const flowMenu2 = require('./flowMenu2')
const flowSecundario = require('./flowSecundario')

// Function to retrieve data for Semester A schedule.
async function cronogramaA() {
    // Connect to the MySQL database
    const connection = await mysql.createConnection({
        host: MYSQL_DB_HOST,
        user: MYSQL_DB_USER,
        password: MYSQL_DB_PASSWORD,
        database: MYSQL_DB_NAME,
        port: MYSQL_DB_PORT,
    });

    try {
        // Execute an SQL query to retrieve data from the 'cronogramaA' table
        const [rows, fields] = await connection.execute('SELECT * FROM cronogramaA');
        return rows;
    } catch (error) {
        console.error(error);
    } finally {
        // Close the connection to the MySQL database
        connection.close();
    }
}

// Variable to track fallBack attempts for flowSemestreA.
let fallBackSemestreA = 0
// Flow for Semester A inquiries.
module.exports = addKeyword('##_flow_semestre_a_##')
    .addAnswer('Este es el cronograma del Semestre A:')
    .addAction(async (ctx, { flowDynamic }) => {
        const data = await cronogramaA();
        let message = '';
        for (let i = 0; i < data.length; i++) {
            const { Fecha, Actividad, Requisito } = data[i];
            message += `*Fecha Límite:* ${Fecha}\n*Actividad:* ${Actividad}\n*Requisitos:* ${Requisito}\n\n`;
        }
        return flowDynamic(message);
    })
    .addAnswer(['Elige una opción: 👇', '\n\n*1.* Cronogramas 📅📋', '*2.* Menú 📚📌', '*3.* Finalizar 🏁🤓'], { capture: true }, async (ctx, { fallBack, gotoFlow, endFlow }) => {
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
            if (fallBackSemestreA < 3) {
                fallBackSemestreA++;
                return fallBack('⚠️ *Selecciona una opcion valida* ⚠️ \n\nIngresa *1* para consultar coronogramas, *2* para volver la menú o *3* para finalizar *BotIS*');
            } else if (fallBackSemestreA === 3) {
                return endFlow({ body: '❌ *Opción no válida* ❌ \n\nChat Bot finalizado, nos vemos luego. 👋🤓' });
            }
        }
    })