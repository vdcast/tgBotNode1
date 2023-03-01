const TelegramApi = require('node-telegram-bot-api')
const {gameOptions, againOptions, homeOptions, infoOptions, supportOptions} = require('./options')
const sequelize = require('./db');
const UserModel = require('./models');

const token = '6186948736:AAGokFqzXTqoJH2lohSSkqN959N85pPcVnk'

const bot = new TelegramApi(token, {polling: true})

const chats = {}

const sendId = 394138933

const startHome = async (chatId, text) => {
//    const chatIdString = chatId.toString()


    const [user, created] = await UserModel.findOrCreate({
        where: { chatId: chatId.toString() }
    });
    console.log(user.username); // 'sdepold'
    console.log(user.job); // This may or may not be 'Technical Lead JavaScript'
    console.log(created); // The boolean indicating whether this instance was just created
    if (created) {
        console.log(user.job); // This will certainly be 'Technical Lead JavaScript'
    }

    await bot.sendMessage(sendId, 'ChatID: ' + chatId + '. Text of message: ' + text)
    await bot.sendSticker(chatId, 'https://cdn.tlgrm.app/stickers/ccd/a8d/ccda8d5d-d492-4393-8bb7-e33f77c24907/192/1.webp')
    await bot.sendMessage(chatId, 'Welcome to vdcast telegram bot. Nice to meet you! :) Please, pick from the following options and use my powerful skills! ^_^');
    return bot.sendMessage(chatId, '/game - Play game and check your luck today! :)\n/info - Get more info.', homeOptions);

}

const startHomeBack = async (chatId, text) => {
    await bot.sendMessage(sendId, 'ChatID: ' + chatId + '. Text of message: ' + text)
    await bot.sendSticker(chatId, 'https://cdn.tlgrm.app/stickers/c1b/025/c1b025fd-1a3a-4e66-8f04-94f42538faf9/96/7.webp')
    return bot.sendMessage(chatId, 'Welcome to vdcast telegram bot. Nice to meet you! :) Please, pick from the following options and use my powerful skills! ^_^', homeOptions);
}

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `Now I will think of digit (0-9) and you need to guess it. Good luck! :)`);
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    return bot.sendMessage(chatId, 'Guess the number...', gameOptions);
}

const startInfo = async (chatId, msg) => {
    const user = await UserModel.findOne({ where: { chatId: chatId.toString() } })
    return bot.sendMessage(chatId, `Your name is ${msg.from.first_name}, user name @${msg.from.username}. Correct answers: ${user.right}. Wrong answers: ${user.wrong}`, infoOptions);
}

const startSupport = async (chatId, text) => {
//    await bot.sendMessage(sendId, 'ChatID: ' + chatId + '. Text of message: ' + text)
    return bot.sendMessage(chatId, 'Send your message here and I`ll answer you ASAP ;)', supportOptions)
}

const start = async () => {

    try {
        await sequelize.authenticate()
        await sequelize.sync()
		console.log('CONNEcting success DB')
    } catch (e) {
        console.log('faiLED connECTION to DB', e)
    }

    bot.setMyCommands([
        {command: '/start', description: 'Welcome to vdcast bot example :)'},
        {command: '/info', description: 'Get information about user'},
        {command: '/game', description: 'Game "Guess The Number"'},
    ])

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
//		const chatIdString = chatId.toString()

        try {
            if (text === '/start') {
                return startHome(chatId, text);
            }
            if (text === '/info') {
//                const user = await UserModel.findOne({ where: { chatId: chatIdString } })
//                await bot.sendMessage(sendId, 'ChatID: ' + chatId + '. Text of message: ' + text)
//                return bot.sendMessage(chatId, `Your name is ${msg.from.first_name}, user name @${msg.from.username}. Correct answers: ${user.right}. Wrong answers: ${user.wrong}`);
                return startInfo(chatId, msg);
            }
            if (text === '/game') {
                await bot.sendMessage(sendId, 'ChatID: ' + chatId + '. Text of message: ' + text)
                return startGame(chatId);
            }



            if (chatId == sendId){
                if (text === "msgChooseChat"){
                    await bot.sendMessage(chatId, "Send me chatid where to send your message");
                    bot.on('message', async msgChooseChat => {
                        const textChooseChat = msgChooseChat.text;
                        try {
                            await bot.sendMessage(textChooseChat, "kek")
                        } catch (e) {
                            await bot.sendMessage(sendId, 'ChatID: ' + chatId + '. Text of message: ' + text)
                            return bot.sendMessage(chatId, 'Some error, checkit!) ' + e);
                        }
                    })
                }
            }



            console.log(msg)
			await bot.sendMessage(sendId, 'ChatID: ' + chatId + '. Text of message: ' + text)
            return bot.sendMessage(chatId, 'Got it! Let me answer you in a while...', supportOptions);
        } catch (e) {
            await bot.sendMessage(sendId, 'ChatID: ' + chatId + '. Text of message: ' + text)
            return bot.sendMessage(chatId, 'Some error, checkit!) ' + e);
        }

        
    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        bot.sendMessage(sendId, chatId + ' | Chose: ' + data)
        if (data === '/again') {
            return startGame(chatId)
        }
        if (data === '/info') {
            return startInfo(chatId, msg);
        }
        if (data === '/home') {
            return startHomeBack(chatId, data);
        }
        if (data === '/support') {
//            bot.on('message', async msgSupport => {
//                const chatIdSupport = msgSupport.message.chat.id;
//                const textSupport = msgSupport.text;
//                await bot.sendMessage(sendId, chatIdSupport + ' | Support message: ' + textSupport);
//            })
            return startSupport(chatId, data);
        }
        const user = await UserModel.findOne({ where: { chatId: chatId.toString() } })
        if (data == chats[chatId]) {
            user.right += 1;
            await bot.sendMessage(chatId, `You've chosen: ${data}, bot made: ${chats[chatId]}`);
            await bot.sendMessage(chatId, `Conratulations! Your are lucky today :)`, againOptions);
        } else {
            user.wrong += 1;
            await bot.sendMessage(chatId, `You've chosen: ${data}, bot made: ${chats[chatId]}`);
            await bot.sendMessage(chatId, `Missed :(`);  
            await bot.sendMessage(chatId, `Play again to try your luck one more time! :)`, againOptions);
        }
        await user.save();
    })
}

start()