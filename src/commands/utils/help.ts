const CustomCommand = require('../../dbModels/customCommand.js');
const config = require('../bot-config.json');

import { Message, RichEmbed as Embed } from 'discord.js';
import { CommandoClient, Command, CommandMessage } from 'discord.js-commando';

export class Help extends Command {
	public constructor(client: CommandoClient) {
		super(client, {
			name: 'help',
			group: 'utils',
			aliases: ['help'],
			memberName: 'help',
			description:
				'Send the user an embed with help information abotu the bot as a dm.',
			args: [
				{
					key: 'type',
					label: 'type',
					prompt: `To list commands, type '~help commands'. To view how to create custom commands, type '~help creation'`,
					type: 'string',
					default: 'commands',
					infinite: false
				}
			]
		});
	}

	public async run(
		msg: CommandMessage,
		args: any
	): Promise<Message | Message[]> {
		CustomCommand.filter({ serverId: msg.guild.id })
			.run({ readMode: 'majority' })
			.then((result: any) => {
				let imageCommands = result.filter(
					(cmd: any) => cmd.commandType === 'image'
				);
				let textCommands = result.filter(
					(cmd: any) => cmd.commandType === 'text'
				);
				let soundCommands = result.filter(
					(cmd: any) => cmd.commandType === 'sound'
				);
				let recordedCommands = result.filter(
					(cmd: any) =>
						cmd.commandType === 'recorded' &&
						!cmd.commandText.includes('-slow') &&
						!cmd.commandText.includes('-fast')
				);
				let embed = {};
				let embedList: Embed[] = [];

				if (args.type === 'commands') {
					embedList = this.buildCommandsHelp(
						imageCommands,
						textCommands,
						soundCommands,
						recordedCommands
					);

					msg.author.send('', embedList[0]).then(() => {
						msg.author.send('', embedList[1]).then(() => {
							msg.author.send('', embedList[2]).then(() => {
								msg.author.send('', embedList[3]).then(() => {
									msg.reply(`Check your DM's`);
								});
							});
						});
					});
				} else if (args.type === 'creation') {
					embed = this.buildCreationHelp();
					msg.author
						.send('', embed)
						.then(() => {
							msg.reply(`Check your DM's`);
						})
						.catch(err => {
							console.log(err);
						});
				} else {
					msg.reply(`That help command is not supported`);
				}
			});

		return await msg.delete();
	}

	private buildCommandsHelp(
		imageCommandsFromDb: any[],
		textCommandsFromDb: any[],
		soundCommandsFromDb: any[],
		recordedCommandsFromDb: any[]
	): Embed[] {
		let embed = new Embed();

		embed.title = `${config.botname} Commands`;
		embed.color = 0x4286f4;

		let textEmbed = new Embed();
		textEmbed.title = 'Text Commands';
		textEmbed.color = 0x4286f4;

		let soundEmbed = new Embed();
		soundEmbed.title = 'Sound Commands';
		soundEmbed.color = 0x4286f4;

		let imageEmbed = new Embed();
		imageEmbed.title = 'Image Commands';
		imageEmbed.color = 0x4286f4;

		let recordedEmbed = new Embed();
		recordedEmbed.title =
			'Recorded Commands (-slow and -fast versions also available)';
		recordedEmbed.color = 0x4286f4;

		// ----- TEXT COMMANDS ----- //

		let loadedTextCommands: any = this.client.registry.resolveGroup('text')
			.commands;

		let allTextCommands = this.buildAllCommands(
			loadedTextCommands,
			textCommandsFromDb
		);

		this.buildCommandString(allTextCommands, textEmbed);

		// ----- IMAGE COMMANDS ----- //

		let loadedImageCommands: any = this.client.registry.resolveGroup('images')
			.commands;

		let allImageCommands = this.buildAllCommands(
			loadedImageCommands,
			imageCommandsFromDb
		);

		this.buildCommandString(allImageCommands, imageEmbed);

		// ----- SOUND COMMANDS ----- //

		let loadedSoundCommands: any = this.client.registry.resolveGroup('sounds')
			.commands;

		let allSoundCommands = this.buildAllCommands(
			loadedSoundCommands,
			soundCommandsFromDb
		);

		this.buildCommandString(allSoundCommands, soundEmbed);

		// ----- RECORDED COMMANDS ----- //

		let recordedCommands: string = '';

		if (recordedCommandsFromDb.length > 0) {
			recordedCommands = recordedCommandsFromDb
				.map(recordedCommand => recordedCommand.commandText.slice(1))
				.sort()
				.join(', ');
		}

		this.buildCommandString(recordedCommands, recordedEmbed);

		return [textEmbed, imageEmbed, soundEmbed, recordedEmbed];
	}

	private buildAllCommands(loadedCommands: any, commandsFromDb: any) {
		let allCommands = loadedCommands.map((command: any) => command.memberName);

		if (commandsFromDb.length > 0) {
			let customCommands = commandsFromDb.map((custom: any) =>
				custom.commandText.slice(1)
			);

			allCommands = allCommands.concat(customCommands);
		}

		allCommands = allCommands.sort().join(', ');

		return allCommands;
	}

	private buildCreationHelp(): Embed {
		let creatingCommands =
			'For creating commands, use the following format:\n' +
			'*~createcommand ~[commandname] [commandtype (image, text, sound)] [imageurl, text, yturl] [starttime (format: 00:00:00)] [duration (seconds)*\n' +
			'Ex:\t\t*~createcommand ~test sound <youtube link> 00:00:43 07*\n' +
			'\t\t*~createcommand ~imagetest image http://i.imgur.com/kTRCbX0.gif*\n\n' +
			'To create custom voice commands (bot records you):\n' +
			'*~recordcommand ~[commandname]\n' +
			'This will create 3 different commands, slow/regular/fast versions of what the bot recorded you saying. To play these commands you would use:\n' +
			'Examples:\t\t*~recordtest-slow*, *~recordtest*, *~recordtest-fast*';

		let deletingCommands = `*~deletecommand ~[commandname]*\n' + 'Ex:\t\t*~deletecommand ~facepalm*`;

		let embed = new Embed();

		embed.title = `${config.botname} Commands`;
		embed.color = 0x4286f4;
		embed.addField(
			'Prefix',
			"Command prefix (trigger) character is '~'",
			false
		);
		embed.addField('Creating Custom Commands', creatingCommands, false);
		embed.addField('Deleting Commands', deletingCommands, false);

		return embed;
	}

	private buildCommandString(commandString: string, embedObject: Embed) {
		if (commandString.length <= 2048) {
			embedObject.setDescription(commandString);
		} else {
			let commandArray = commandString.split(',');
			let tempArray: any[] = [];
			let charCount = 0;
			let descriptionSet = false;

			for (let commandName of commandArray) {
				charCount += commandName.length;
				tempArray.push(commandName);

				if (charCount >= 1900) {
					embedObject.setDescription(tempArray.join(', '));
					charCount = 0;
					tempArray = [];

					descriptionSet = true;
				}

				if (descriptionSet && charCount >= 900) {
					embedObject.addField(
						`${embedObject.title} (Contd.)`,
						tempArray.join(', '),
						false
					);
					charCount = 0;
					tempArray = [];
				}
			}

			let existsInEmbed = embedObject.fields.filter((field: any) =>
				field.value.includes(tempArray[0])
			);

			if (
				tempArray.length > 0 &&
				embedObject.description &&
				!embedObject.description.includes(tempArray[0]) &&
				existsInEmbed.length === 0
			) {
				embedObject.addField(
					`${embedObject.title} (Contd.)`,
					tempArray.join(', '),
					false
				);
			}
		}
	}
}
