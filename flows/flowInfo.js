const { addKeyword } = require('@bot-whatsapp/bot')
const flowSemestreA = require('./flowSemetreA')
const flowSemestreB = require('./flowSemestreB')

// Variable to keep track of fallBack attempts for flowInfo.
let fallBackInfo = 0
// Flow for information retrieval.
module.exports = addKeyword('##_flow_info_##')
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