let DATOS = {};

const { createBot, createProvider, createFlow, addKeyword, EVENTS, CoreClass } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const mysql = require('mysql2/promise');
const ChatGPTClass = require('./chatgpt')
const { PROMPT } = require('./prompt')
const { typing } = require("./stateWriting");

const chatGPTInstance = new ChatGPTClass();


const MYSQL_DB_HOST = 'localhost';
const MYSQL_DB_USER = 'root';
const MYSQL_DB_PASSWORD = '';
const MYSQL_DB_NAME = 'chatbot';
const MYSQL_DB_PORT = '3306';

let fallBackSecundario = 0
const flowSecundario = addKeyword('##-flow-secundario-##')
  .addAnswer('👍 Muchas gracias por utilizar el chat Bot del programa de *Ingeniería de sistemas* de la *Universidad Mariana*. 👍')
  .addAnswer('Elige una opción: 👇🏼 ')
  .addAnswer(['*1.* Menú 📚📌', '*2.* Para finalizar BotIS 🏁🤓'], { capture: true }, async (ctx, { fallBack, gotoFlow, endFlow }) => {

    if (ctx.body === '2') {
      return endFlow({ body: '*Chat Bot finalizado* , nos vemos luego. 👋🤓' })
    }
    else if (ctx.body === '1') {
      gotoFlow(flowMenu)
    }
    else if (ctx.body !== '1' && ctx.body != '2') {
      if (fallBackSecundario < 3) {
        fallBackSecundario++;
        return fallBack('⚠️ *Selecciona una opcion valida* ⚠️ \n\nIngresa *1* para volver al menú principal o *2* para finalizar *BotIS*');
      } else if (fallBackSecundario === 3) {
        return endFlow({ body: '❌ *Opción no válida* ❌ \n\nChat Bot finalizado, nos vemos luego. 👋🤓' });
      }
    }
  })

//const mysql = require('mysql');
const db = mysql.createConnection({
  host: MYSQL_DB_HOST,
  user: MYSQL_DB_USER,
  password: MYSQL_DB_PASSWORD,
  database: MYSQL_DB_NAME,
  port: MYSQL_DB_PORT
});

const flowPregunta = addKeyword('##_flow_menu_##')
  .addAnswer('*Preguntale a BotIS* 🤖')
  .addAnswer('🤖 Conectando con la inteligencia artificial de *BotIS...* \n\nPor favor, espera un momento.🕜 \n\nRecuerda que para volver al *menú principal* , solo necesitas escribir la palabra *salir*. 💻📲', null, async (ctx, { provider }) => {
    await typing(provider, ctx, 4000);
    await chatGPTInstance.handleMsgChatGPT(PROMPT)
  })
  .addAnswer('✔️ *Todo esta listo* ✔️ \n\nEscribe tu pregunta sobre el proceso investigativo 🤔❓ de *Ingenieria de Sistemas* de la *Universidad Mariana*',
    { capture: true }, async (ctx, { flowDynamic, fallBack, gotoFlow, provider }) => {
      const response = await chatGPTInstance.handleMsgChatGPT(ctx.body);
      const message = response.text;

      if (!/^salir$/i.test(ctx.body.toString())) {
        await typing(provider, ctx, 4000);
        await fallBack(message);
      }
      else if (/(^|\s)salir(\s|$)/i.test(ctx.body.toString())) {
        gotoFlow(flowMenu)
      }

    })

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
const flowFechaGrado = addKeyword('##-flow-grado-##')
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
      gotoFlow(flowMenu);
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

async function obtenerFila() {
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
    const [rows, fields] = await connection.execute('SELECT * FROM fechaprogtesis');
    return rows;
  } catch (error) {
    console.error(error);
  } finally {
    // Cierra la conexión a la base de datos MySQL
    connection.close();
  }
}

let fallbackSustentacion = 0
const flowFechaProgramadasTesis = addKeyword('##-flow-sustentacion-##')
  .addAnswer('Estas son las fechas programadas:')
  .addAction(async (ctx, { flowDynamic }) => {
    const data = await obtenerFila();
    if (!data.length) {
      // Si no se encontraron fechas, envía un mensaje informativo
      return flowDynamic('En este momento no hay fechas de sustentaciones programadas.');
    }
    let message = '';
    for (let i = 0; i < data.length; i++) {
      const { Fecha, Hora, Nombre, Fase, Lugar, Jurados, Expositores, Asesor } = data[i];
      message += `*Fecha:* ${Fecha} \n*Hora:* ${Hora} \n*Proyecto:* ${Nombre} \n*Fase:* ${Fase} \n*Lugar:* ${Lugar} \n*Jurados:* ${Jurados} \n*Expositores:* ${Expositores} \n*Asesor/a:* ${Asesor} \n\n`;
    }
    return flowDynamic(message);
  })
  .addAnswer('Elige una opción: 👇🏼')
  .addAnswer(['*1.* Cronogramas 📅📋', '*2.* Menú 📚📌', '*3.* Finalizar 🏁🤓'], { capture: true }, async (ctx, { fallBack, gotoFlow, endFlow }) => {
    if (ctx.body === '1') {
      gotoFlow(flowInfo);
    }
    else if (ctx.body === '2') {
      gotoFlow(flowMenu);
    }
    else if (ctx.body === '3') {
      gotoFlow(flowSecundario);
    }
    else if (ctx.body !== '1' && ctx.body != '2' && ctx.body != '3') {
      if (fallbackSustentacion < 3) {
        fallbackSustentacion++;
        return fallBack('⚠️ *Selecciona una opcion valida* ⚠️ \n\nIngresa *1* para consultar los cronogramas de los semestres, *2* para volver al menú principal o *3* para finalizar *BotIS*');
      } else if (fallbackSustentacion === 3) {
        return endFlow({ body: '❌ *Opción no válida* ❌ \n\nChat Bot finalizado, nos vemos luego. 👋🤓' });
      }
    }
  })

let fallbackFechas = 0
const flowFechas = addKeyword('##-flow-fechas-##')
  .addAnswer('Aquí podrá consultar las fechas de *grados* o de *sustentaciones* programadas. 🎓🗓️')
  .addAnswer(['*1.* Grados 📆🎓', '*2.* Sustentación 📝📑', '*3.* Menú 📚📌', '*4.* Finalizar 🏁🤓'], { capture: true }, async (ctx, { fallBack, gotoFlow, endFlow }) => {
    if (ctx.body === '1') {
      gotoFlow(flowFechaGrado);
    }
    else if (ctx.body === '2') {
      gotoFlow(flowFechaProgramadasTesis);
    }
    else if (ctx.body === '3') {
      gotoFlow(flowMenu);
    }
    else if (ctx.body === '4') {
      gotoFlow(flowSecundario);
    }
    else if (ctx.body !== '1' && ctx.body != '2' && ctx.body != '3') {
      if (fallbackFechas < 3) {
        fallbackFechas++;
        return fallBack('⚠️ *Selecciona una opcion valida* ⚠️ \n\nIngresa *1* para consultar fechas de grados, *2* para consultar fechas de sustentaciones, *3* para volver la menú principal o *4* para finalizar *BotIS*');
      } else if (fallbackFechas === 3) {
        return endFlow({ body: '❌ *Opción no válida* ❌ \n\nChat Bot finalizado, nos vemos luego. 👋🤓' });
      }
    }
  })

let fallbackMenu = 0
const flowMenu = addKeyword('##-flow-menu-##')
  .addAnswer('🤓 *Bienvenido* 🤓 \n\nSelecciona la opción que más sea de tu interes ingresando el número correspondiente: 🔢👇')
  .addAnswer(['*Menú principal* 📚📌,\n\n*1.* Preguntas sobre el proceso investigativo 🤔❓', '*2.* Consultar las fechas de sustentaciones o grados 🎓🗓️', '*3.* Cronogramas 📅📋', '*4.* Finalizar esta opción 🏁🤓'], { capture: true }, async (ctx, { fallBack, gotoFlow, endFlow }) => {
    if (ctx.body === '1') {
      gotoFlow(flowPregunta);
    }
    else if (ctx.body === '2') {
      gotoFlow(flowFechas);
    }
    else if (ctx.body === '4') {
      gotoFlow(flowSecundario);
    }
    else if (ctx.body === '3') {
      gotoFlow(flowInfo)
    }
    else if (ctx.body !== '1' && ctx.body != '2' && ctx.body != '3' && ctx.body != '4') {
      if (fallbackMenu < 3) {
        fallbackMenu++;
        return fallBack('⚠️ *Selecciona una opcion valida* ⚠️ \n\nIngresa *1* Para preguntas a la IA sobre el proceso investigativo, *2* para consultar fechas de grados o sustentacion, *3* para consultar cronogramas de los semestres o *4* para finalizar *BotIS*');
      } else if (fallbackMenu === 3) {
        return endFlow({ body: '❌ *Opción no válida* ❌ \n\nChat Bot finalizado, nos vemos luego. 👋🤓' });
      }
    }
  })



// Configura los parámetros de conexión a la base de datos MySQL


async function cronogramaB() {
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
    const [rows, fields] = await connection.execute('SELECT * FROM cronogramab');
    return rows;
  } catch (error) {
    console.error(error);
  } finally {
    // Cierra la conexión a la base de datos MySQL
    connection.close();
  }
}

let fallBackSemestreB = 0
const flowSemestreB = addKeyword('##-flow-semestre-b-##')
  .addAnswer('Este es el cronograma del Semestre B:')
  .addAction(async (ctx, { flowDynamic }) => {
    const data = await cronogramaB();
    let message = '';
    for (let i = 0; i < data.length; i++) {
      const { Fecha, Actividad, Requisitos } = data[i];
      message += `*Fecha Límite:* ${Fecha}\n*Actividad:* ${Actividad}\n*Requisitos:* ${Requisitos}\n\n`;
    }
    return flowDynamic(message);
  })
  .addAnswer(['Elige una opción: 👇🏼 ', '\n\n*1.* Cronogramas 📅📋', '*2.* Menú 📚📌', '*3.* Finalizar 🏁🤓'], { capture: true }, async (ctx, { fallBack, gotoFlow, endFlow }) => {
    if (ctx.body === '1') {
      gotoFlow(flowInfo);
    }
    else if (ctx.body === '2') {
      gotoFlow(flowMenu);
    }
    else if (ctx.body === '3') {
      gotoFlow(flowSecundario);
    }
    else if (ctx.body !== '1' && ctx.body != '2' && ctx.body != '3') {
      if (fallBackSemestreB < 3) {
        fallBackSemestreB++;
        return fallBack('⚠️ *Selecciona una opcion valida* ⚠️ \n\nIngresa *1* para consultar coronogramas, *2* para volver la menú o *3* para finalizar *BotIS*');
      } else if (fallBackSemestreB === 3) {
        return endFlow({ body: '❌ *Opción no válida* ❌ \n\nChat Bot finalizado, nos vemos luego. 👋🤓' });
      }
    }
  })




async function cronogramaA() {
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
    const [rows, fields] = await connection.execute('SELECT * FROM cronogramaA');
    return rows;
  } catch (error) {
    console.error(error);
  } finally {
    // Cierra la conexión a la base de datos MySQL
    connection.close();
  }
}

let fallBackSemestreA = 0
const flowSemestreA = addKeyword('##-flow-semestre-a-##')
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
      gotoFlow(flowMenu);
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

let fallBackInfo = 0
const flowInfo = addKeyword('##-flow-info-##')
  .addAnswer(['¿Qué semestre deseas consultar? 🕓📆', '*1.* Semestre *A*', '*2.* Semestre *B*'], { capture: true }, async (ctx, { fallBack, gotoFlow, endFlow }) => {
    if (ctx.body === '1' || ctx.body === 'a') {
      gotoFlow(flowSemestreA);
    }
    else if (ctx.body === '2' || ctx.body === 'b') {
      gotoFlow(flowSemestreB);
    }
    else if (ctx.body !== '1' && ctx.body != '2') {
      if (fallBackInfo < 3) {
        fallBackInfo++;
        return fallBack('⚠️ *Selecciona una opcion valida* ⚠️ \n\nIngresa *1* para consultar el semestre A o *2* pra consultar el semestre B');
      } else if (fallBackInfo === 3) {
        return endFlow({ body: '❌Opción no válida.❌ Chat Bot finalizado, nos vemos luego. 👋🤓' });
      }
    }
  })

// Función para validar el correo electrónico
async function validarCorreo(correo) {
  // Conexión a la base de datos
  const connection = await mysql.createConnection({
    host: MYSQL_DB_HOST,
    user: MYSQL_DB_USER,
    password: MYSQL_DB_PASSWORD,
    database: MYSQL_DB_NAME,
    port: MYSQL_DB_PORT
  });

  try {
    // Ejecutar la consulta
    const query = `SELECT correo FROM correo WHERE correo = '${correo}'`;
    const [rows, fields] = await connection.query(query);

    // Procesar los resultados
    const correosValidos = rows.map(row => row.correo);


    return correosValidos;

  } catch (error) {
    console.error(error);
    throw new Error('Error al obtener los correos válidos');
  } finally {
    // Cerrar la conexión a la base de datos
    connection.end();
  }
}

// Función para validar el correo electrónico
async function validarCorreo(correo) {
  // Conexión a la base de datos
  const connection = await mysql.createConnection({
    host: MYSQL_DB_HOST,
    user: MYSQL_DB_USER,
    password: MYSQL_DB_PASSWORD,
    database: MYSQL_DB_NAME,
    port: MYSQL_DB_PORT
  });

  try {
    // Ejecutar la consulta
    const query = `SELECT correo FROM correo WHERE correo = '${correo}'`;
    const [rows, fields] = await connection.query(query);

    // Procesar los resultados
    const correosValidos = rows.map(row => row.correo);


    return correosValidos;

  } catch (error) {
    console.error(error);
    throw new Error('Error al obtener los correos válidos');
  } finally {
    // Cerrar la conexión a la base de datos
    connection.end();
  }
}

let fallBackSiNo = 0;
let fallBackCount = 0;
// Flujo principal del chatbot
const flowPrincipal = addKeyword(EVENTS.WELCOME)
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
      // Envío de notificación si se retorna fallBack 3 veces
      fallBackCount++;
      if (fallBackCount === 3) {
        return endFlow({ body: '❌ *Correo no Valido* ❌ \n\nChat Bot finalizado, nos vemos luego. 👋🤓' });
        // Código para enviar la notificación
      } else {
        fallBack('⚠️ *Correo no encontrado* ⚠️ \n\nSe requiere que el usuario sea estudiante o docente de Ingeniería de Sistemas de la Universidad Mariana y que inicie sesión utilizando su correo institucional. Vuelve a intentarlo!!');
      }
    }
  })


const main = async () => {
  const adapterDB = new MockAdapter()
  const adapterFlow = createFlow([flowPrincipal, flowMenu, flowSecundario, flowPregunta, flowFechas, flowFechaProgramadasTesis,
    flowFechaGrado, flowInfo, flowSemestreA, flowSemestreB])
  const adapterProvider = createProvider(BaileysProvider)

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  })

  const botName = 'BotIS'
  QRPortalWeb({ name: botName, port: 3005 })
}

main()