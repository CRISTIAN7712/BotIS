// Import the 'dotenv' module to load environment variables from a '.env' file.

require('dotenv').config()

// Class definition for ChatGPTClass.
class ChatGPTClass {
  queue = [];
  optionsGPT = { model: "babbage" };
  openai = undefined;

  constructor() {
    this.init().then();
  }

  init = async () => {
    const { ChatGPTAPI } = await import("chatgpt");
    this.openai = new ChatGPTAPI({
      apiKey: process.env.OPENAI_API_KEY
    });
  };

  handleMsgChatGPT = async (body) => {
    try {
      const interaccionChatGPT = await this.openai.sendMessage(body, {
        conversationId: !this.queue.length
          ? undefined
          : this.queue[this.queue.length - 1].conversationId,
        parentMessageId: !this.queue.length
          ? undefined
          : this.queue[this.queue.length - 1].id,
      });

      this.queue.push(interaccionChatGPT);
      return interaccionChatGPT;
    } catch (error) {
      console.error('Error al conectar con la API de OpenAI:', error);
      throw error;
    }
  };
}

module.exports = ChatGPTClass;
