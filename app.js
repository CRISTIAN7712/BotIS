let DATOS = {};
const { createBot, createProvider, createFlow, CoreClass } = require('@bot-whatsapp/bot')// Import necessary modules and libraries for bot creation.
const QRPortalWeb = require('@bot-whatsapp/portal')// Import the QRPortalWeb module for handling QR code-based authentication.
const BaileysProvider = require('@bot-whatsapp/provider/baileys')// Import the BaileysProvider module for WhatsApp bot functionality.
const MockAdapter = require('@bot-whatsapp/database/mock')// Import the MockAdapter module for mocking database functionality.

const flowPrincipal = require('./flows/flowPrincipal');
const flowMenu = require('./flows/flowMenu');
const flowInfo = require('./flows/flowInfo');
const flowSemetreA = require('./flows/flowSemetreA');
const flowSemestreB = require('./flows/flowSemestreB');
const flowMenu2 = require('./flows/flowMenu2');
const flowFechas = require('./flows/flowFechas');
const flowFechaGrado = require('./flows/flowFechaGrado');
const flowFechaProgramadasTesis = require('./flows/flowFechaProgramadasTesis');
const flowSecundario = require('./flows/flowSecundario');
const flowPregunta = require('./flows/flowPregunta');


// Import required modules and libraries.
const main = async () => {
  const adapterDB = new MockAdapter()// Create a MockAdapter for database operations.  
  const adapterFlow = createFlow([flowPrincipal, flowMenu, flowInfo, flowSemetreA, flowSemestreB, flowMenu2, flowFechas, flowFechaGrado, flowFechaProgramadasTesis, flowSecundario, flowPregunta])// Create a flow by combining multiple flow functions.  
  const adapterProvider = createProvider(BaileysProvider)// Create a provider using BaileysProvider for WhatsApp functionality.

  // Create a WhatsApp bot with the specified flow, provider, and database.
  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  })


  const botName = 'BotIS'// Define the bot's name as 'BotIS'.  
  QRPortalWeb({ name: botName, port: 3005 })// Initialize the QR code portal for the bot on port 3005.
}

// Call the main function to start the bot.
main()