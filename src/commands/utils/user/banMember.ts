import { Message, GuildMember, MessageMentions } from 'discord.js';
import { CommandoClient, Command, CommandMessage } from 'discord.js-commando';

export class BanMember extends Command {
	public constructor(client: CommandoClient) {
		super(client, {
			name: 'addRole',
			group: 'utils',
			memberName: 'addRole',
			description: 'Adds a user to a specified role',
			args: [
				{
					key: 'member',
					label: 'member',
					prompt: 'Please provide a user to add the role to (as a mention)',
					type: 'member'
				},
				{
					key: 'banReason',
					label: 'banReason',
					prompt: 'Please provide a reason that the user was banned for',
					type: 'string'
				}
			]
		});
	}

	public async run(
		msg: CommandMessage,
		args: any
	): Promise<Message | Message[]> {
		let mentions: MessageMentions = msg.mentions as MessageMentions;

		if (mentions.members.size === 0)
			return msg.reply(
				'You must provide a user in a mention to use this command'
			);

		let member: GuildMember = mentions.members.first();

		await member.ban(args.reason);

		return msg.say(`${member.user.username} was banned.`);
	}
}
