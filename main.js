const mineflayer = require("mineflayer");
const gui = require("mineflayer-gui");

const fs = require("fs");
// const { deepStrictEqual } = require("assert");

var PLAYERINFO = {

    username : 'YOUR@EMAIL.EXEMPLE' ,
    
    password : 'YOUR MINECRAFT PASSWORD' ,
    
    host : 'mc.hypixel.net' ,
    
    port : 25565 ,
    
    version : '1.8.9',
    auth: 'mojang'
    };


let firstContestTime = {time: 0,otherTimeFound: 0};
let timeWhenOpenCalendar = 0;
let hasjoinSkyblock = 0;
let scriptstared = parseInt(new Date().getTime()/1000) - 60;
const bot = mineflayer.createBot(PLAYERINFO); // etc.
bot.loadPlugin(gui.plugin);


bot.once("spawn", () =>
{
    console.log(`Join ${PLAYERINFO.host}:${PLAYERINFO.port} using ${PLAYERINFO.version}`);
}
)

bot.on("message", async json => 
{
    let message = json.toString();
    if(message.includes("❤")) {return;}

    console.log(`${message}`);
    

    if (message.includes("SkyBlock!")) 
    {
        hasjoinSkyblock = 1;
        console.log(`\t"${message}" was catch because it contains "SkyBlock!"`)

        bot.chat("/calendar"); // The "/settings" command will bring up a GUI window.  
    }
    else if (message.includes("réclamées")) 
    {
        console.log(`\t"${message}" was catch because it contains "réclamées"`)

        //bot.chat("/skyblock"); // The "/settings" command will bring up a GUI window.  
    }
    else if (message.includes("slid into the lobby!"))
    {
        console.log(`\t"${message}" was catch because it contains "slid into the lobby!"`)

        if(hasjoinSkyblock == 0)
        {
            if(parseInt(new Date().getTime()/1000) > scriptstared + 60)
            {
                scriptstared = parseInt(new Date().getTime()/1000);
                bot.chat("/skyblock");
            }
        }
        
    }
    
});




bot.on('windowOpen', async (window) => {
    window.requiresConfirmation = false; // fix
    //bot.chat(`${window.title}`)
    //await bot.clickWindow(0, 0, 0);
    console.log("\tNew Window detected : " + window.title.split("\":\"")[1].substring(0,window.title.split("\":\"")[1].length-2))
    if (window.title.includes("Calendar and Events"))
    {
        console.log("\t Main calendar has been opened !")
        let compassSlot = GetCompassInCalendar(window);
        if (compassSlot == -1)
        {
            console.log("\tNo clock found");
            bot.quit();
        }
        else
        {
            fs.writeFileSync('result.txt', "",err=> { 
                if(err) { console.err; return;}});
            timeWhenOpenCalendar = parseInt(new Date().getTime()/1000);
            console.log(`\tEPOCH TIME = ${timeWhenOpenCalendar}`);
            await bot.clickWindow(compassSlot, 0, 0); // click on clock slot to open the next menu
        }
    }

    else if(window.title.includes("Year"))
    {
        console.log("\tPrecise calendar has been opened !")
        getEveryContest(window,firstContestTime);

        let compassSlot = GetNextArrowInCalendar(window);
        if (compassSlot == -1)
        {
            console.log("\tNo more 'next arrow' now we can leave");
            bot.quit();
            console.log("\tServer leaved... Results of scanning can be found in result.txt");
        }
        else
        {
            //console.log(`${compassSlot}`)
            await bot.clickWindow(compassSlot, 0, 0); // click on clock slot to open the next menu
        }
    }
       
  })

function GetCompassInCalendar(window)
{
    
    if(window == null) return -1;

    for(i = 0; i < window.slots.length;i++)
    {
        if(window.slots[i] != null)
        {
            // bot.chat(`Slot ${i} : ${bot.gui.item.getName(window.slots[i])}`);
            if(window.slots[i].name == "clock")
            {
                console.log(`\t\t${bot.gui.item.getName(window.slots[i])} : ${bot.gui.item.getLore(window.slots[i])}`)
                return window.slots[i].slot;
            }
        }
    }
    
    return -1;
}

function GetNextArrowInCalendar(window)
{
    
    if(window == null) return -1;

    for(i = 0; i < window.slots.length;i++)
    {
        if(window.slots[i] != null)
        {
            // bot.chat(`Slot ${i} : ${bot.gui.item.getName(window.slots[i])}`);
            if(window.slots[i].name == "arrow")
            {
                if(bot.gui.item.getName(window.slots[i]).text.includes("Next"))
                {
                    console.log(`\tAnalysing : ${bot.gui.item.getLore(window.slots[i])}`)
                    return window.slots[i].slot;
                }
            }
        }
    }
    return -1;
}


function getEveryContest(window,firstContestTime)
{
    if(window == null) return;
    fs.appendFileSync('result.txt', window.title.split("\":\"")[1].substring(0,window.title.split("\":\"")[1].length-2) +";" + '\n',err=> { 
        if(err) { console.err; return;}});

    for(i = 0; i < window.slots.length;i++)
    {
        if(window.slots[i] != null)
        {
            // bot.chat(`Slot ${i} : ${bot.gui.item.getName(window.slots[i])}`);
            if(window.slots[i].name != "stained_glass_pane" && window.slots[i].name != "barrier")
            {
                
                let text = bot.gui.item.getLore(window.slots[i]).toString();
                if(text.includes("Jacob's Farming Contest"))
                {
                    if(firstContestTime.time == 0)
                    {
                        if(text.includes("Jacob's Farming Contest ("))
                        {
                            let beginMinuteIndex = text.indexOf("Jacob's Farming Contest (") + "Jacob's Farming Contest (".length
                            
                            let min = parseInt(text[beginMinuteIndex] + text[beginMinuteIndex+1]);
                            let sec = parseInt(text[beginMinuteIndex+4] + text[beginMinuteIndex+5]);
                            firstContestTime.time = timeWhenOpenCalendar + min *60 + sec;
                            
                        }
                    }
                    else
                    {
                        firstContestTime.otherTimeFound+=1;

                        
                    }

                    let debugTxt = `${bot.gui.item.getName(window.slots[i])};`
                    if(firstContestTime.time == 0)
                    debugTxt += `AlreadyPassed;`;
                    else
                        debugTxt += `${firstContestTime.time + firstContestTime.otherTimeFound*60*60};`;

                    
                    
                    if (text.includes("Wheat")) {debugTxt += "Wheat;";}
                    if (text.includes("Carrot")) {debugTxt += "Carrot;";}
                    if (text.includes("Potato")) {debugTxt += "Potato;";}
                    if (text.includes("Pumpkin")) {debugTxt += "Pumpkin;";}
                    if (text.includes("Melon")) {debugTxt += "Melon;";}
                    if (text.includes("Mushroom")) {debugTxt += "Mushroom;";}
                    if (text.includes("Cactus")) {debugTxt += "Cactus;";}
                    if (text.includes("Sugar Cane")) {debugTxt += "Sugar Cane;";}
                    if (text.includes("Nether Wart")) {debugTxt += "Nether Wart;";}
                    if (text.includes("Cocoa Beans")) {debugTxt += "Cocoa Beans;";}

                    fs.appendFileSync('result.txt', debugTxt + '\n',err=> { 
                        if(err) { console.err; return;}});

                    // console.log(debugTxt);
                    
                    
                }
            }
        }
    }
    
}