const fs = require('fs');
const stringSimilarity = require('string-similarity');

module.exports.config = {
    name: "guessword",
    hasPermission: 0,
    description: "Guess the scrambled word",
    credits: "Jonell Magallanes",
    usePrefix: true,
    cooldowns: 10,
    commandCategory: "Quiz",
};

let correctAnswers = [];

module.exports.handleReply = function({ api, event, handleReply }) {
    const userAnswer = event.body.trim().toLowerCase();
    const correctAnswer = correctAnswers[event.threadID]?.Word.trim().toLowerCase();
    const similarityThreshold = 0.6;

    try {
        if (userAnswer === correctAnswer) {
            api.sendMessage(`𝗚𝘂𝗲𝘀𝘀 𝘁𝗵𝗲 𝗦𝗰𝗿𝗮𝗺𝗯𝗹𝗲𝗱 𝗪𝗼𝗿𝗱\n━━━━━━━━━━━━━━━━━━\n✅ Correct! Well done!\nWord: ${correctAnswers[event.threadID].Word}\nHint: ${correctAnswers[event.threadID].Hint}`, event.threadID, event.messageID);
            delete correctAnswers[event.threadID];
            const index = global.client.handleReply.findIndex(e => e.messageID === handleReply.messageID);
            if (index !== -1) {
                global.client.handleReply.splice(index, 1);
            }
        } else {
            const similarity = stringSimilarity.compareTwoStrings(userAnswer, correctAnswer);
            if (similarity >= similarityThreshold) {
                api.sendMessage(`𝗚𝘂𝗲𝘀𝘀 𝘁𝗵𝗲 𝗦𝗰𝗿𝗮𝗺𝗯𝗹𝗲𝗱 𝗪𝗼𝗿𝗱\n━━━━━━━━━━━━━━━━━━\n🔍 Close! Your answer is very similar. Try again.`, event.threadID, event.messageID);
            } else {
                api.sendMessage(`𝗚𝘂𝗲𝘀𝘀 𝘁𝗵𝗲 𝗦𝗰𝗿𝗮𝗺𝗯𝗹𝗲𝗱 𝗪𝗼𝗿𝗱\n━━━━━━━━━━━━━━━━━━\n❌ Incorrect Answer. Please try again.`, event.threadID, event.messageID);
            }
        }
    } catch (error) {
        console.error('Error checking answer:', error);
        api.sendMessage('There was an error checking your answer. Please try again later.', event.threadID, event.messageID);
    }
};

module.exports.run = function({ api, event }) {
    try {
        const wordsData = JSON.parse(fs.readFileSync('./modules/commands/cache/words.json', 'utf8'));
        const randomIndex = Math.floor(Math.random() * wordsData.length);
        const randomWord = wordsData[randomIndex];
        correctAnswers[event.threadID] = randomWord;
        api.sendMessage({
            body: `𝗚𝘂𝗲𝘀𝘀 𝘁𝗵𝗲 𝗦𝗰𝗿𝗮𝗺𝗯𝗹𝗲𝗱 𝗪𝗼𝗿𝗱\n━━━━━━━━━━━━━━━━━━\nScrambled Word: ${randomWord.Scrambled}\nHint: ${randomWord.Hint}`,
        }, event.threadID, (err, info) => {
            if (err) {
                console.error('Error sending message:', err);
                return;
            }
            global.client.handleReply.push({
                name: module.exports.config.name,
                messageID: info.messageID,
                correctAnswer: randomWord
            });
        });
    } catch (error) {
        console.error('Error fetching word information:', error);
        api.sendMessage('There was an error fetching the word. Please try again later.', event.threadID, event.messageID);
    }
};
