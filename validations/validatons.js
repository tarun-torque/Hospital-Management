import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const messages = {
    string: 'The {{ field }} field must be a string',
  }

 vine.messagesProvider = new SimpleMessagesProvider(messages)
  

const contentCategory_validation = vine.object({
    category:vine.string(),
    description:vine.string()
})


export default contentCategory_validation
