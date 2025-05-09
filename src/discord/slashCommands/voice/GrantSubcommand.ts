import {ChatInputCommandInteraction, GuildMember, MessageFlags, SlashCommandSubcommandBuilder} from "discord.js";

import {getChannelFromMember} from "../../../lib/utils";

import {DiscordChannelStatus} from "../../../lib/sequelize/models/discordchannel.model";

import ReplyManager, {createBaseEmbed} from "../../../lib/managers/ReplyManager";
import TwineSubcommand from "../../../lib/interfaces/commands/TwineSubcommand";
import ManagedChannel from "../../../lib/objects/ManagedChannel";

export default class GrantSubcommand implements TwineSubcommand {
    data = new SlashCommandSubcommandBuilder()
        .setName("grant")
        .setDescription("Modifies grant settings for the voice channel");

    async execute(interaction: ChatInputCommandInteraction, replyManager: ReplyManager<ChatInputCommandInteraction>): Promise<void> {
        let channel: ManagedChannel;

        try {
            channel = getChannelFromMember(<GuildMember>interaction.member, interaction.user.id);
        } catch (e) {
            await replyManager.error(e.message);
            return;
        }

        if (channel.status === DiscordChannelStatus.PUBLIC) {
            await replyManager.error("You can't change grant permissions on a public channel!");
            return;
        }

        await interaction.reply({
            embeds: [
                createBaseEmbed(interaction.guild)
                    .setTitle("Update Grant Permissions")
                    .setDescription(`Currently updating grant permissions for ${channel.discord.url}`)
            ],
            components: [
                channel.constructGrantComponent(),
            ],
            flags: MessageFlags.Ephemeral,
        }).catch(() => {});
    }

}
