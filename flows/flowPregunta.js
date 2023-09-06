const { addKeyword } = require('@bot-whatsapp/bot')
const ChatGPTClass = require('../chatgpt')// Import the ChatGPTClass for handling GPT-based chat interactions.
const { PROMPT } = require('../prompt') // Import the PROMPT constant containing a long text for GPT conversations.
const { typing } = require('../stateWriting')// Import the 'typing' function for managing typing indicators.
const flowMenu2 = require('./flowMenu2')

const chatGPTInstance = new ChatGPTClass();// Create an instance of the ChatGPTClass for GPT-based chat interactions.

module.exports = addKeyword('##_flow_pregunta_##')
    .addAnswer('*Preguntale a BotIS* 🤖')
    .addAnswer('🤖 Conectando con la inteligencia artificial de *BotIS...* \n\nPor favor, espera un momento.🕜 \n\nRecuerda que para volver al *menú principal* , solo necesitas escribir la palabra *salir*. 💻📲', null, async (ctx, { provider }) => {
        await typing(provider, ctx, 4000);
        await chatGPTInstance.handleMsgChatGPT(PROMPT);

    })
    .addAnswer('✔️ *Todo esta listo* ✔️ \n\nEscribe tu pregunta sobre el proceso investigativo 🤔❓ de *Ingenieria de Sistemas* de la *Universidad Mariana*',
        { capture: true }, async (ctx, { flowDynamic, fallBack, gotoFlow, provider }) => {
            try {
                const response = await chatGPTInstance.handleMsgChatGPT(ctx.body);
                const message = response.text;

                if (!/^salir$/i.test(ctx.body.toString())) {
                    await typing(provider, ctx, 4000);
                    await fallBack(message);
                } else if (/(^|\s)salir(\s|$)/i.test(ctx.body.toString())) {
                    gotoFlow(flowMenu2);
                }
            } catch (error) {
                // Manejar la excepción cuando la API no responde en este bloque
                console.error('Error al conectar con la API en el segundo bloque:', error);
                // Puedes agregar un mensaje de error o tomar alguna otra acción apropiada aquí
            }
        });

//const mysql = require('mysql');
// const db = mysql.createConnection({
//   host: MYSQL_DB_HOST,
//   user: MYSQL_DB_USER,
//   password: MYSQL_DB_PASSWORD,
//   database: MYSQL_DB_NAME,
//   port: MYSQL_DB_PORT
// });




// const flowPregunta = addKeyword('##_flow_pregunta_##')
//   .addAnswer('*Preguntale a BotIS* 🤖')
//   .addAnswer('🤖 Conectando con la inteligencia artificial de *BotIS...* \n\nPor favor, espera un momento.🕜 \n\nRecuerda que para volver al *menú principal* , solo necesitas escribir la palabra *salir*. 💻📲', null, async (ctx, { provider }) => {
//     await typing(provider, ctx, 4000);
//     await chatGPTInstance.handleMsgChatGPT(PROMPT)
//   })
//   .addAnswer('✔️ *Todo esta listo* ✔️ \n\nEscribe tu pregunta sobre el proceso investigativo 🤔❓ de *Ingenieria de Sistemas* de la *Universidad Mariana*',
//     { capture: true }, async (ctx, { flowDynamic, fallBack, gotoFlow, provider }) => {
//       const response = await chatGPTInstance.handleMsgChatGPT(ctx.body);
//       const message = response.text;

//       if (!/^salir$/i.test(ctx.body.toString())) {
//         await typing(provider, ctx, 4000);
//         await fallBack(message);
//       }
//       else if (/(^|\s)salir(\s|$)/i.test(ctx.body.toString())) {
//         gotoFlow(flowMenu2)
//       }

//     })

// const flowPregunta = addKeyword(['Preguntas sobre el proceso investigativo 🤔❓', 'Realizar otra pregunta🤔📜', 'Pregunta', 'Preguntas'])
// .addAnswer('La respuesta puede demorar según la complejidad de tú pregunta. 🕗')
// .addAnswer('Realiza tu pregunta sobre el proceso investigativo. 🤖❓',{capture:true}, async (ctx, {flowDynamic}) => {
//     let message = ctx.body;
//     DATOS[ctx.from] = {...DATOS[ctx.from], MSGPregunta:ctx.body}
//     DATOS[ctx.from] = {...DATOS[ctx.from], Movil:ctx.from}
//     console.log('=====>>', DATOS[ctx.from])
//     try {
//         const result = await ChatGPTClass.runCompletion(message);

//         const connection = await pool.getConnection();
//       const [rows, fields] = await connection.execute(
//         'INSERT INTO preguntasgpt (telefono, pregunta, respuesta) VALUES (?, ?, ?)',
//         [DATOS[ctx.from].Movil, DATOS[ctx.from].MSGPregunta, result]
//       );

//         return flowDynamic('*La respuesta a tu pregunta es:*\n'+result);
//     } catch (error) {
//         console.log(error);
//         return flowDynamic('⚠ Lo siento, ocurrió un error al procesar tu pregunta. Por favor, inténtalo de nuevo más tarde.');
//     }
// })
// .addAnswer('Selecciona una opción:')
// .addAnswer(['Pregunta: Para realizar otra pregunta🤔📜', 'Menú 🔙😃', 'Finalizar 🔚🤓'])



