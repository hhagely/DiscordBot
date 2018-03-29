import { Message, MessageMentions, GuildMember } from 'discord.js';
import { CommandoClient, Command, CommandMessage } from 'discord.js-commando';

export class RemoveRole extends Command {
	public constructor(client: CommandoClient) {
		super(client, {
			name: 'removeRole',
			group: 'utils',
			memberName: 'removeRole',
			description: 'Remove a specified role from a specified user',
			args: [
				{
					key: 'member',
					label: 'member',
					prompt: 'Please provide a user to add the role to (as a mention)',
					type: 'member'
				},
				{
					key: 'role',
					label: 'role',
					prompt:
						'Please provide a role to add the user to (as a mention or by typing the role name)',
					type: 'role'
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
				'You must provde a user in a mention to use this command'
			);

		let member: GuildMember = mentions.members.first();
		let role;
		if (mentions.roles.size === 0) {
			role = msg.guild.roles.find('name', args.role);

			if (!role) {
				return msg.reply('The role provided was not found');
			} else {
				role = mentions.roles.first();
			}

			member.removeRole(role);

			return msg.say(
				`${member.user.username} was removed from the ${role.name} role`
			);
		}
	}
}
