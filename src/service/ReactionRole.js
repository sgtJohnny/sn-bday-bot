require('dotenv').config(); //initialize dotenv

module.exports = {

    async handle(reaction, user, add) {
        if (reaction.partial) { //this whole section just checks if the reaction is partial
            try {
                await reaction.fetch(); //fetches reaction because not every reaction is stored in the cache
            } catch (error) {
                console.error('Fetching message failed: ', error);
                return;
            }
        }

        try {
            //Check if the Reaction is on the message that needs to be reacted to
            if (reaction.message.id != process.env.MESSAGE_TO_REACT) {
                return;
            }

            const emojiRecation = reaction.emoji.name.toString();
            console.log(`User:${user.username} reacted on message: ${reaction.message.id} with ${escape(emojiRecation)}`);
            const rolelink = JSON.parse(process.env.EMOJI_ROLE_LINK);
            const availableRoles = JSON.parse(process.env.AVAILABLE_ROLES);
            let found = -1;

            for (let index = 0; index < rolelink.length; ++index) {
                let entry = rolelink[index];
                if (entry == emojiRecation) {
                    console.log(`found emoji at pos ${index}`);
                    found = index;
                    break;
                }
            }

            if (found != -1) {
                const role = reaction.message.guild.roles.cache.find(r => r.id == availableRoles[found]); //finds role you want to assign (you could also user .name instead of .id)
                const member = reaction.message.guild.members.cache.find(member => member.id === user.id); //find the member who reacted (because user and member are seperate things)

                if (add) {
                    console.log(`Add role ${role} to user ${member}`);
                    member.roles.add(role); //assign selected role to member
                    user.send(({ content: `Dir wurde die Rolle **${role.name}** auf dem Sprintnugget Discord zugewiesen`, ephemeral: true }));

                } else {
                    console.log(`Remove role ${role} to user ${member}`);
                    member.roles.remove(role); //remove selected role to member
                    user.send(({ content: `Dir wurde die Rolle **${role.name}** auf dem Sprintnugget Discord entzogen`, ephemeral: true }));
                }
            } else {
                console.log("No roles for this emoji were found.")
            }
        } catch (error) {
            console.log(console.error('Error: ', error));
        }
    }
}