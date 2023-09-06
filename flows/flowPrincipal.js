const { addKeyword, EVENTS } = require('@bot-whatsapp/bot')
const mysql = require('mysql2/promise');// Import the 'mysql2' library for database operations.
const { MYSQL_DB_HOST, MYSQL_DB_USER, MYSQL_DB_PASSWORD, MYSQL_DB_NAME, MYSQL_DB_PORT } = require('../data'); // Asegúrate de que la ruta sea correcta si el archivo data.js está en un directorio diferente.
const flowMenu = require('./flowMenu')


// Function to validate an email address
async function validarCorreo(correo) {
    // Database connection
    const connection = await mysql.createConnection({
        host: MYSQL_DB_HOST,
        user: MYSQL_DB_USER,
        password: MYSQL_DB_PASSWORD,
        database: MYSQL_DB_NAME,
        port: MYSQL_DB_PORT
    });

    try {
        // Execute the query
        const query = `SELECT correo FROM correo WHERE correo = '${correo}'`;
        const [rows, fields] = await connection.query(query);

        // Process the results
        const correosValidos = rows.map(row => row.correo);


        return correosValidos;

    } catch (error) {
        console.error(error);
        throw new Error('Error al obtener los correos válidos');
    } finally {
        // Close the database connection
        connection.end();
    }
}


let fallBackCount = 0;
// Main chatbot flow
module.exports = addKeyword(EVENTS.WELCOME)
    .addAnswer('👋 ¡Hola! Soy *BotIS* 🤖')
    .addAnswer('Soy tu asistente para la investigación en *Ingeniería de Sistemas* en la *Universidad Mariana* 🎓. Estoy aquí para ayudarte en todo. \n\n*¡Vamos a hacer que tu investigación sea un éxito!* 💪📚🔍')
    .addAnswer('¿Cuál es tu correo institucional? 📧🧐', { capture: true }, async (ctx, { fallBack, endFlow, gotoFlow }) => {
        try {
            const correosValidos = await validarCorreo(ctx.body);
            if (correosValidos.includes(ctx.body)) {
                console.log('Correo válido:', ctx.body);
                gotoFlow(flowMenu);

            } else {
                throw new Error('Correo inválido');
            }
        } catch (error) {
            console.error(error);
            // Sending a notification if fallBack is returned 3 times
            fallBackCount++;
            if (fallBackCount === 3) {
                // Code for sending the notification
                return endFlow({ body: '❌ *Correo no Valido* ❌ \n\nChat Bot finalizado, nos vemos luego. 👋🤓' });
            } else {
                fallBack('⚠️ *Correo no encontrado* ⚠️ \n\nSe requiere que el usuario sea estudiante o docente de Ingeniería de Sistemas de la Universidad Mariana y que inicie sesión utilizando su correo institucional. Vuelve a intentarlo!!');
            }
        }
    })