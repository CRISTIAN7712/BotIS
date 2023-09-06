const { addKeyword } = require('@bot-whatsapp/bot')
const flowPregunta = require('./flowPregunta')
const flowFechas = require('./flowFechas')
const flowInfo = require('./flowInfo')
const flowSecundario = require('./flowSecundario')

// Variable to track fallBack attempts for flowMenu2.
let fallbackMenu2 = 0
// Main menu2 flow.
module.exports = addKeyword('##_flow_menu_2_##')
    .addAnswer('Selecciona la opción que más sea de tu interes ingresando el número correspondiente: 🔢👇')
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
            if (fallbackMenu2 < 3) {
                fallbackMenu2++;
                return fallBack('⚠️ *Selecciona una opcion valida* ⚠️ \n\nIngresa *1* Para preguntas a la IA sobre el proceso investigativo, *2* para consultar fechas de grados o sustentacion, *3* para consultar cronogramas de los semestres o *4* para finalizar *BotIS*');
            } else if (fallbackMenu2 === 3) {
                return endFlow({ body: '❌ *Opción no válida* ❌ \n\nChat Bot finalizado, nos vemos luego. 👋🤓' });
            }
        }
    })