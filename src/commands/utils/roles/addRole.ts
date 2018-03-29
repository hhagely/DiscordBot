import { Message, MessageMentions, GuildMember, Role } from 'discord.js';
import { CommandoClient, CommandMessage, Command } from 'discord.js-commando';

export class AddRole extends Command {
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
				'You must provide a user in a mention to use this command'
			);

		let member: GuildMember = mentions.members.first();
		let role: Role;
		if (mentions.roles.size === 0) {
			role = msg.guild.roles.find('name', args.role);

			if (!role) {
				return msg.reply('The role provided was not found');
			}
		} else {
			role = mentions.roles.first();
		}

		member.addRole(role);

		return msg.say(
			`${member.user.username} is now part of the ${role.name} role`
		);
	}
}
