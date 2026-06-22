import SteamAPI from "steamapi";
import { Client, GatewayIntentBits } from "discord.js";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const ssmClient = new SSMClient({});

async function getParameter(name: string): Promise<string> {
  const response = await ssmClient.send(new GetParameterCommand({ Name: name, WithDecryption: true }));
  return response.Parameter!.Value!;
}

const lustboisDiscordId = "192761549029507072";
const ryanDiscordId = "148840937055846400";
const ryanSteamId64 = "76561198068282941";
const finalFantasySteamId = 39210;

export const handler = async (event: unknown, context: { functionName: string }) => {
  const [discordToken, steamApiKey] = await Promise.all([
    getParameter("/shame/discord-token"),
    getParameter("/shame/steam-api-key"),
  ]);

  const time = new Date();
  console.log(`Your cron function "${context.functionName}" ran at ${time}`);

  const steam = new SteamAPI(steamApiKey);
  const discord = new Client({ intents: [GatewayIntentBits.GuildMembers] });

  await discord.login(discordToken);
  console.log("Shame is online!");
  try {
    await updateRyanNickname(steam, discord);
  } catch (e) {
    console.log(e);
  } finally {
    await discord.destroy();
  }
};

async function updateRyanNickname(steam: SteamAPI, discord: Client) {
  const ryanGames = await steam.getUserOwnedGames(ryanSteamId64);
  const finalFantasyGame = ryanGames.find((game: any) => game.appID === finalFantasySteamId);
  if (finalFantasyGame == null) {
    console.error(`Could not find Final Fantasy game for ${ryanSteamId64}`);
    return;
  }
  const playtime = Math.round(finalFantasyGame.playTime / 60);
  console.log(`Found ${playtime} hours in FFXIV`);
  const lustbois = await discord.guilds.fetch(lustboisDiscordId);
  const ryanDiscord = await lustbois.members.fetch(ryanDiscordId);
  const nickname = ryanDiscord.nickname;
  if (nickname == null) {
    console.error(`Could not retrieve nickname for discord Id: ${ryanDiscordId}`);
    return;
  }
  console.log(`Old Nickname: ${nickname}`);
  const updatedNickname = nickname.replace(/\(\d+\)/, `(${playtime})`);
  console.log(`New Nickname: ${updatedNickname}`);
  await ryanDiscord.setNickname(updatedNickname);
}
