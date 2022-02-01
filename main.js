const mineflayer = require("mineflayer");
const gui = require("mineflayer-gui");

const fs = require("fs");
// const { deepStrictEqual } = require("assert");

var PLAYERINFO = {

    username : 'YourMinecraftAccountEmail@EMAIL.EXAMPLE' , // TODO
    
    password : 'YourMinecraftAccountPassword' , // TODO
    
    host : 'mc.hypixel.net' ,
    
    port : 25565 ,
    
    version : '1.8.9',
    auth: 'microsoft' // TODO use 'microsoft' or 'mojang'
    };


// GENERAL VAR
let firstContestTime = {time: 0,otherTimeFound: 0};
let timeWhenOpenCalendar = 0;
let scriptstared = parseInt(new Date().getTime()/1000); // this time will change everytime the bot type /skyblock
let REALTIMESCRIPTSTARED = parseInt(new Date().getTime()/1000); // this will be unchanged
let hasjoinSkyblock = 0;

// BOT INIT
const bot = mineflayer.createBot(PLAYERINFO);
bot.loadPlugin(gui.plugin);

// This is trigger once (when the player connect the server)
bot.once("spawn", () =>
{
    console.log(`Join ${PLAYERINFO.host}:${PLAYERINFO.port} using ${PLAYERINFO.version}`);
}
)

// This is trigger everytime a message in send in the IG-chat
bot.on("message", async json => 
{
    let message = json.toString();
    if(message.includes("❤")) {return;} // Tellraw also trigger this function

    console.log(`${message}`);

    if(message.includes("AFK.")) // It seems that we are AFK
    {
        console.log("It seems we are AFK")
        bot.quit();
    }
    
    // To not spam the server when try to join skyblock using /skyblock only once every 10 seconds (in case the skyblock is unreacheable for some reason)
    if (hasjoinSkyblock == 0)
    {

        if (message.includes("SkyBlock!")) // We joined successfully the skyblock
        {
            hasjoinSkyblock = 1;
            console.log(`\tSkyblock joined successfully`)

            bot.chat("/calendar"); // The "/settings" command will bring up a GUI window.  
        }

        else if (parseInt(new Date().getTime()/1000) - REALTIMESCRIPTSTARED > 100)
        {
            console.log(`\tSkyblock seems unreachable leaving the server ...`)
            bot.quit();
        }

        else if(parseInt(new Date().getTime()/1000) - scriptstared > 10)
        {
            console.log(`\t10 seconds passed since last attempt let try to join skyblock`)
            scriptstared = parseInt(new Date().getTime()/1000);
            bot.chat("/skyblock");
        }
        
        else
        {
            console.log(`\tOnly ${parseInt(new Date().getTime()/1000) - scriptstared} seconds has not passed since last try and ${parseInt(new Date().getTime()/1000) - REALTIMESCRIPTSTARED} since the player joined the server!, waiting at least 10 seconds to not spam hypixel with command`)
        }
    }

    
    
});



// This function is trigger every time a Gui is open (like game selector, calendar, chest, furnace, ....)
bot.on('windowOpen', async (window) => {
    window.requiresConfirmation = false; // Fix to work on server which uses spigot plugin to open GUI
    
    console.log("\tNew Window detected : " + window.title.split("\":\"")[1].substring(0,window.title.split("\":\"")[1].length-2))
    
    
    if (window.title.includes("Calendar and Events"))
    {
        console.log("\t Main calendar has been opened !")
        let compassSlot = GetCompassInCalendar(window); // Get the slot when the compass is
        if (compassSlot == -1)
        {
            console.log("\tNo clock found");
            bot.quit();
        }
        else
        {
            fs.writeFileSync('result.csv', "",err=> { 
                if(err) { console.err; return;}}); // clearing previous result.csv
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
            console.log("\tServer leaved... Results of scanning can be found in result.csv");
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
    fs.appendFileSync('result.csv', window.title.split("\":\"")[1].substring(0,window.title.split("\":\"")[1].length-2) +";" + '\n',err=> { 
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

                    fs.appendFileSync('result.csv', debugTxt + '\n',err=> { 
                        if(err) { console.err; return;}});

                    // console.log(debugTxt);
                    
                    
                }
            }
        }
    }
    
}