const TelegramBot = require('node-telegram-bot-api');
var FileSaver = require('file-saver');

const token = '703634415:AAGnwP5GwecuHYTi6rseW0EuQmJBxPnYqKQ';
const bot = new TelegramBot(token, {polling: true});

var fs = require('fs');
// const ref = firebase.database().ref(); // holding the reference to our database
// const sitesRef = ref.child("sites"); // holding the reference to the child

// let siteUrl; // store received URL
var begin = true;
var finish = false;

var location_array = ['Republic of Kazakhstan', 'Almaty city', 'Astana city', 'Akmola region', 'Aktobe region', 'Almaty region', 'Atyrau region',
'West Kazakhstan region', 'Zhambyl region', 'Karagandy region', 'Kostanay region', 'Kyzylorda region', 'Mangystau region', 'South Kazakhstan region',
'Pavlodar region', 'North Kazakhstan region', 'East Kazakhstan region', 'Shymkent city'];

var category_array = ['Все проблемы', 'Безопасность', 'Бизнес', 'Государственное управление', 'ЖКХ', 'Здравоохранение', "Земельные отношения",
"Инфраструктура", "Коррупция", "Трудовые отношения", "Судебно-правовая система", "Межэтнические и религиозные обращения", "Образование",
"Общественный транспорт", "Транспорт и автомобильные дороги", "Экология", "Другое"];

var user_id;


bot.on("message", (msg) => {
    if(begin){
        if(msg.text == "/start"){ 
            user_id = msg.from.id;
            
            bot.sendMessage(user_id, "Welcome! This bot is here to accept your reports.");
            bot.sendMessage(user_id, 'Please choose the location of your report, from the following list:', {
                reply_markup: JSON.stringify({
                inline_keyboard:
                    location_array.map((x, xi) => ([{
                        text: x,
                        callback_data: String(xi),
                    }])),
                })
            })
            begin = false;
        }
        else bot.sendMessage(msg.chat.id, "Your input is invalid. Write /begin");
    }
});


var dir = "./dirs";
if(!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

for(var i = 0; i < location_array.length; i++){
    var loc = location_array[i];
    dir = 'dirs/' + loc;

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    for(var j = 0; j < category_array.length; j++){
        var cat = category_array[j];
        dir = "dirs/" + loc + "/" + cat;
        
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
    }
}

var location;
var category;

var loc_chosen = false;

bot.on("callback_query", (callbackQuery) => {
    if(!loc_chosen){
        location = callbackQuery.data;
        bot.sendMessage(user_id, 'You chose location ' + location_array[location]);
        loc_chosen = true;

        bot.sendMessage(user_id,'Now, please choose a category', {
            reply_markup: JSON.stringify({
            inline_keyboard:
                category_array.map((x, xi) => ([{
                    text: x,
                    callback_data: String(xi),
                }])),
            })
        })
    }
    else{
        category = callbackQuery.data;
        bot.sendMessage(user_id, 'You chose category ' + category_array[category] + ". Please write your report.");
        loc_chosen = false;
        begin = false;
        finish = true;
    }
});

bot.on('text', (mes) => {
    if(!begin && finish){
        var docItem;
        if(mes.from.username != undefined)
            docItem = String(mes.from.username + '.txt');
        else
            docItem = String(mes.from.id + '.txt');

        
        fs.writeFileSync('dirs/' + location_array[location] + '/' + category_array[category] + '/' + docItem, mes.text);

        bot.sendMessage(mes.chat.id, "Your message was sent!");
        begin = true;
        finish = false;
    }
});
    
