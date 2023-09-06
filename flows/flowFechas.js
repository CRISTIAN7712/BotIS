const { addKeyword } = require('@bot-whatsapp/bot')
const flowFechaGrado = require('./flowFechaGrado')
const flowFechaProgramadasTesis = require('./flowFechaProgramadasTesis')
const flowMenu2 = require('./flowMenu2')
const flowSecundario = require('./flowSecundario')

let fallbackFechas = 0
module.exports = addKeyword('##_flow_fechas_##')
    .addAnswer('Aquí podrá consultar las fechas de *grados* o de *sustentaciones* programadas. 🎓🗓️')
    .addAnswer(['*1.* Grados 📆🎓', '*2.* Sustentación 📝📑', '*3.* Menú 📚📌', '*4.* Finalizar 🏁🤓'], { capture: true }, async (ctx, { fallBack, gotoFlow, endFlow }) => {
        if (ctx.body === '1') {
            gotoFlow(flowFechaGrado);
        }
        else if (ctx.body === '2') {
            gotoFlow(flowFechaProgramadasTesis);
        }
        else if (ctx.body === '3') {
            gotoFlow(flowMenu2);
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