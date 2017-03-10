var dotenv = require('dotenv')
var Botkit = require('./lib/Botkit.js');
var os = require('os');

dotenv.load()

var controller = Botkit.facebookbot({
    debug: true,
    log: true,
    access_token: process.env.PAGE_TOKEN,
    verify_token: process.env.VERIFY_TOKEN,
    app_secret: process.env.APP_SECRET,
    validate_requests: true, // Refuse any requests that don't come from FB on your receive webhook, must provide FB_APP_SECRET in environment variables
});

var bot = controller.spawn({
});

controller.setupWebserver(process.env.PORT || 3000, function(err, webserver) {
    controller.createWebhookEndpoints(webserver, bot, function() {
        console.log('ONLINE!');
    });
});




controller.api.thread_settings.greeting('這裡住著一隻小小聊天機器人，跟他說說話吧～');
controller.api.thread_settings.get_started('sample_get_started_payload');
controller.api.thread_settings.menu([
    {
        "type":"postback",
        "title":"你好！",
        "payload":"hello"
    },
    {
        "type":"postback",
        "title":"你會做些什麼？",
        "payload":"help"
    },
    {
        "type":"postback",
        "title":"告訴我現在幾點",
        "payload":"time"
    },
]);


// 聽到你好就問好
controller.hears(['嗨', '哈囉', '你好', '您好', '安安', '你好', 'hello', 'hi'], 'message_received,facebook_postback', function(bot, message) {
    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, '嗨嗨，' + user.name + '！我是小E！');
        } else {
            bot.reply(message, '嗨嗨！我是小E！');
        }
    });
});


// 問我名字就回覆他
controller.hears(['你是', '你叫', 'who are you'], 'message_received',
    function(bot, message) {
        bot.reply(message,
                '我是生活在Eason的部落格裡頭的小機器人，叫我小E吧！');
    });


// 問我時間就告訴他
controller.hears(['時間', '幾點', 'time'], 'message_received,facebook_postback',
    function(bot, message) {
        bot.reply(message,
                '現在時間是 '+getDateTime());
    });


// 問我會做什麼就告訴他
controller.hears(['你會', '你能', 'help'],'message_received,facebook_postback', function(bot, message) {
    bot.reply(message, '很高興你問了！你可以問我：\n'+
                        '現在幾點？\n'+
                        '你是誰？');
});



// 聽不懂就跟他說我會做什麼
controller.on('message_received', function(bot, message) {
    bot.reply(message, '我不太懂你的意思，你可以問我：\n'+
                        '現在幾點？\n'+
                        '你是誰？');
    return false;
});


// 用來得到現在時間
function getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + "年" + month + "月" + day + "日 " + hour + "點" + min + "分" + sec + "秒";
}
