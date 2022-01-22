<h1 align="center">Jacob Contest Tracker on Hypixel</h1>
<div align="center">
<img src="example.gif">
<p>(An example the script running without error (speed up from 20 seconds to 8 seconds))</p>
</div>



# What is this repo for ?
This repo contains javascript file to extract every Jacob's contest on Hypixel Skyblock.

## How it works
Using node.js and mineflayer package.
The bot is able to connect on mc.hypixel.net:25565, join Skyblock mode, open the in-game calendar and extract every Jacob's contest.



## How to run it
First you need to install Node.js
Then run both commands in your terminal to install dependency
```bash
npm install mineflayer
npm install mineflayer-gui
```

Run main.js using
```bash
node main.js
```
Wait for several seconds/minutes (depending on your connection).
You follow the execution in the terminal.
When the script is done, you can find the result in the file result.txt next to main.js file

## How it collects the data
Because there is no way to get Jacob's contest event throught Hypixel API.
I have made a bot which analyse in-game GUI especially Item Name and Item Lore.
The Item Lore contains the list of crops for the contest.

