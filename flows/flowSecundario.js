const { addKeyword } = require('@bot-whatsapp/bot')
const flowMenu2 = require('./flowMenu2')

let fallBackSecundario = 0
module.exports = addKeyword('##_flow_secundario_##')
    .addAnswer('👍 Muchas gracias por utilizar el chat Bot del programa de *Ingeniería de sistemas* de la *Universidad Mariana*. 👍')
    .addAnswer('Elige una opción: 👇🏼 ')
    .addAnswer(['*1.* Menú 📚📌', '*2.* Para finalizar BotIS 🏁🤓'], { capture: true }, async (ctx, { fallBack, gotoFlow, endFlow }) => {

        if (ctx.body === '2') {
            return endFlow({ body: '*Chat Bot finalizado* , nos vemos luego. 👋🤓' })
        }
        else if (ctx.body === '1') {
            gotoFlow(flowMenu2)
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