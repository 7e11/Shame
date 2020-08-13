// Secrets
const {discordToken, steamApiKey} = require('./secrets');

console.log(process.cwd());

const SteamAPI = require('steamapi');
const steam = new SteamAPI(steamApiKey);

const Discord = require('discord.js');
const client = new Discord.Client();

const ryanSteamLink = "https://steamcommunity.com/id/Shadow1176/";
const ryanSteamId64 = "76561198068282941";
const ryanDiscordId = "148840937055846400";
const finalFantasySteamId = 39210
const lustboisDiscordId = "192761549029507072";

// Discord callback
client.once('ready', () => {
  console.log('Shame is online!');
  updateNickname().then((promise) => {
    client.destroy();
  });
});

async function updateNickname() {
  const games = await steam.getUserOwnedGames(ryanSteamId64);
  const finalFantasyGame = games.find(game => game.appID === finalFantasySteamId)
  // playtime in minutes -> hours
  const playtime = Math.floor(finalFantasyGame.playTime / 60);
  console.log(`Found ${playtime} hours in FFXIV`);

  // Interface with discord
  const lustbois = client.guilds.resolve(lustboisDiscordId);
  const ryan = lustbois.member(ryanDiscordId);
  const nickname = ryan.nickname;
  console.log(`Old Nickname: ${nickname}`);
  const regex = new RegExp(String.raw`\(\d+\)`);
  const updatedNickname = nickname.replace(regex, `(${playtime})`);
  console.log(`New Nickname: ${updatedNickname}`);
  ryan.setNickname(updatedNickname);
}

// Azure Function
module.exports = async function (context, myTimer) {
  client.login(discordToken);
};

// For local testing, uncomment this and run: node "c:\Users\Evan.Evan-Desktop\Projects\ShameDiscordBot\ShameDiscordBot\index.js"
// client.login(discordToken);