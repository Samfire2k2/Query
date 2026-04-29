export async function InstallGlobalCommands(appId, commands) {
  if (!appId) {
    return;
  }

  if (commands.length > 0) {
    const endpoint = `https://discord.com/api/v10/applications/${appId}/commands`;

    try {
      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        method: 'PUT',
        body: JSON.stringify(commands),
      });

      if (res.ok) {
        console.log('✅ Registered all commands with Discord');
      } else {
        console.error('❌ Error registering commands');
        let errorText = `Error registering commands \n ${res.status}: ${res.statusText}`;
        const error = await res.text();
        if (error) {
          errorText = `${errorText} \n\n ${error}`;
        }
        console.error(errorText);
      }
    } catch (err) {
      console.error(err);
    }
  }
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
