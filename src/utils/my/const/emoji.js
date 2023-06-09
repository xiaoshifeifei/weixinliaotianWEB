

const emojiTempList = [
    {"filename":"e-01","english":"smile","chinese":"微笑"},
    {"filename":"e-02","english":"joy","chinese":"快乐"},
    {"filename":"e-03","english":"heart-eyes","chinese":"色咪咪"},
    {"filename":"e-04","english":"sweat_smile","chinese":"汗"},
    {"filename":"e-05","english":"laughing","chinese":"大笑"},
    {"filename":"e-06","english":"wink","chinese":"眨眼"},
    {"filename":"e-07","english":"yum","chinese":"百胜"},
    {"filename":"e-08","english":"relieved","chinese":"放松"},
    {"filename":"e-09","english":"fearful","chinese":"可怕"},
    {"filename":"e-10","english":"ohYeah","chinese":"欧耶"},
    {"filename":"e-11","english":"cold-sweat","chinese":"冷汗"},
    {"filename":"e-12","english":"scream","chinese":"尖叫"},
    {"filename":"e-13","english":"kissing_heart","chinese":"亲亲"},
    {"filename":"e-14","english":"smirk","chinese":"得意"},
    {"filename":"e-15","english":"angry","chinese":"害怕"},
    {"filename":"e-16","english":"sweat","chinese":"沮丧"},
    {"filename":"e-17","english":"stuck","chinese":"卡住"},
    {"filename":"e-18","english":"rage","chinese":"愤怒"},
    {"filename":"e-19","english":"etriumph","chinese":"生气"},
    {"filename":"e-20","english":"mask","chinese":"面具"},
    {"filename":"e-21","english":"confounded","chinese":"羞愧"},
    {"filename":"e-22","english":"sunglasses","chinese":"太阳镜"},
    {"filename":"e-23","english":"sob","chinese":"在"},
    {"filename":"e-24","english":"blush","chinese":"脸红"},
    {"filename":"e-26","english":"doubt","chinese":"疑惑"},
    {"filename":"e-27","english":"flushed","chinese":"激动"},
    {"filename":"e-28","english":"sleepy","chinese":"休息"},
    {"filename":"e-29","english":"sleeping","chinese":"睡着"},
    {"filename":"e-30","english":"disappointed_relieved","chinese":"失望"},
    {"filename":"e-31","english":"tire","chinese":"累"},
    {"filename":"e-32","english":"astonished","chinese":"惊讶"},
    {"filename":"e-33","english":"buttonNose","chinese":"抠鼻"},
    {"filename":"e-34","english":"frowning","chinese":"皱眉头"},
    {"filename":"e-35","english":"shutUp","chinese":"闭嘴"},
    {"filename":"e-36","english":"expressionless","chinese":"面无表情"},
    {"filename":"e-37","english":"confused","chinese":"困惑"},
    {"filename":"e-38","english":"tired_face","chinese":"厌倦"},
    {"filename":"e-39","english":"grin","chinese":"露齿而笑"},
    {"filename":"e-40","english":"unamused","chinese":"非娱乐"},
    {"filename":"e-41","english":"persevere","chinese":"坚持下去"},
    {"filename":"e-42","english":"relaxed","chinese":"傻笑"},
    {"filename":"e-43","english":"pensive","chinese":"沉思"},
    {"filename":"e-44","english":"no_mouth","chinese":"无嘴"},
    {"filename":"e-45","english":"worried","chinese":"担心"},
    {"filename":"e-46","english":"cry","chinese":"哭"},
    {"filename":"e-47","english":"pill","chinese":"药"},
    {"filename":"e-48","english":"celebrate","chinese":"庆祝"},
    {"filename":"e-49","english":"gift","chinese":"礼物"},
    {"filename":"e-50","english":"birthday","chinese":"生日 "},
    {"filename":"e-51","english":"paray","chinese":"祈祷"},
    {"filename":"e-52","english":"ok_hand","chinese":"好"},
    {"filename":"e-53","english":"first","chinese":"冠军"},
    {"filename":"e-54","english":"v","chinese":"耶"},
    {"filename":"e-55","english":"punch","chinese":"拳头"},
    {"filename":"e-56","english":"thumbsup","chinese":"赞"},
    {"filename":"e-57","english":"thumbsdown","chinese":"垃圾"},
    {"filename":"e-58","english":"muscle","chinese":"肌肉"},
    {"filename":"e-59","english":"maleficeent","chinese":"鼓励"},
    {"filename":"e-60","english":"broken_heart","chinese":"心碎"},
    {"filename":"e-61","english":"heart","chinese":"心 "},
    {"filename":"e-62","english":"taxi","chinese":"出租车"},
    {"filename":"e-63","english":"eyes","chinese":"眼睛"},
    {"filename":"e-64","english":"rose","chinese":"玫瑰"},
    {"filename":"e-65","english":"ghost","chinese":"鬼"},
    {"filename":"e-66","english":"lip","chinese":"嘴唇"},
    {"filename":"e-67","english":"fireworks","chinese":"烟花"},
    {"filename":"e-68","english":"balloon","chinese":"气球"},
    {"filename":"e-69","english":"clasphands","chinese":"握手"},
    {"filename":"e-70","english":"bye","chinese":"抱拳"}
];


let emojiSources = {}
emojiTempList.forEach(emoj=>{
    let image = require('@/assets/image/emoji/' + emoj.filename + '.png');
    let name = `[${emoj.english}]`
    emojiSources[name] = `<img class="emoji" src='${image}'>`;
})



let gifList = [
    {"filename":"eight.gif","english":"eight"},
    {"filename":"eighteen.gif","english":"eighteen"},
    {"filename":"eleven.gif","english":"eleven"},
    {"filename":"fifity.gif","english":"fifity"},
    {"filename":"fifity_four.gif","english":"fifity_four"},
    {"filename":"fifity_one.gif","english":"fifity_one"},
    {"filename":"fifity_three.gif","english":"fifity_three"},
    {"filename":"fifity_two.gif","english":"fifity_two"},
    {"filename":"fifteen.gif","english":"fifteen"},
    {"filename":"five.gif","english":"five"},
    {"filename":"forty.gif","english":"forty"},
    {"filename":"forty_eight.gif","english":"forty_eight"},
    {"filename":"forty_five.gif","english":"forty_five"},
    {"filename":"forty_four.gif","english":"forty_four"},
    {"filename":"forty_nine.gif","english":"forty_nine"},
    {"filename":"forty_one.gif","english":"forty_one"},
    {"filename":"forty_seven.gif","english":"forty_seven"},
    {"filename":"forty_three.gif","english":"forty_three"},
    {"filename":"forty_two.gif","english":"forty_two"},
    {"filename":"fourteen.gif","english":"fourteen"},
    {"filename":"nine.gif","english":"nine"},
    {"filename":"nineteen.gif","english":"nineteen"},
    {"filename":"one.gif","english":"one"},
    {"filename":"seven.gif","english":"seven"},
    {"filename":"seventeen.gif","english":"seventeen"},
    {"filename":"sixteen.gif","english":"sixteen"},
    {"filename":"ten.gif","english":"ten"},
    {"filename":"thirteen.gif","english":"thirteen"},
    {"filename":"thirty.gif","english":"thirty"},
    {"filename":"thirty_eight.gif","english":"thirty_eight"},
    {"filename":"thirty_five@.gif","english":"thirty_five@"},
    {"filename":"thirty_four.gif","english":"thirty_four"},
    {"filename":"thirty_nine.gif","english":"thirty_nine"},
    {"filename":"thirty_seven.gif","english":"thirty_seven"},
    {"filename":"thirty_six.gif","english":"thirty_six"},
    {"filename":"thirty_three.gif","english":"thirty_three"},
    {"filename":"thirty_two.gif","english":"thirty_two"},
    {"filename":"thirty-one.gif","english":"thirty-one"},
    {"filename":"three.gif","english":"three"},
    {"filename":"twelve.gif","english":"twelve"},
    {"filename":"twenty.gif","english":"twenty"},
    {"filename":"twenty_eight.gif","english":"twenty_eight"},
    {"filename":"twenty_five.gif","english":"twenty_five"},
    {"filename":"twenty_four.gif","english":"twenty_four"},
    {"filename":"twenty_nine.gif","english":"twenty_nine"},
    {"filename":"twenty_one.gif","english":"twenty_one"},
    {"filename":"twenty_seven.gif","english":"twenty_seven"},
    {"filename":"twenty_six.gif","english":"twenty_six"},
    {"filename":"twenty_three.gif","english":"twenty_three"},
    {"filename":"twenty_two.gif","english":"twenty_two"}
];
let gifSources = []
gifList.forEach(emoj=>{
    let image = require('@/assets/image/gif/' + emoj.filename);
    let name = `${emoj.filename}`
    gifSources.push({
        name: name,
        src: image
    })
})


export {emojiSources, gifSources};
