import { OrderedMap, Map } from 'immutable'

export default function PlayerInteraction(focusedPlayerName) {

    // -- Player ---------------------------------------------------------------

    function Player(name, rosterId) {
        const player = {
            name,
            rosterId,
            health: 100,
            healthColor: '#00FF00B0',
            kills: 0,
            location: { x: 0, y: 0, z: 0 },
            helmet: null,
            vest: null,
        }

        player.focusType = (() => {
            if (name === focusedPlayerName) return 'player'
            if (rosterId === focusedRosterId) return 'teammate'
            return 'none'
        })()

        const immutablePlayer = Map(player)

        return setPlayerStatus(immutablePlayer, 'alive')
    }

    // -- Initialize participants map ------------------------------------------

    return OrderedMap().withMutations(map => {
        // We want the focused player to be the first entry in our OrdredMap...
        const focusedPlayer = matchData.players.find(p => p.name === focusedPlayerName)
        map.set(focusedPlayerName, Player(focusedPlayer.name, focusedPlayer.rosterId))

        // ...followed by their teammates...
        matchData.players
            .filter(p => p.name !== focusedPlayer.name)
            .filter(p => p.rosterId === focusedPlayer.rosterId)
            .forEach(p => {
                map.set(p.name, Player(p.name, p.rosterId))
            })

        // ...followed by everyone else
        matchData.players
            .filter(p => p.rosterId !== focusedPlayer.rosterId)
            .forEach(p => {
                map.set(p.name, Player(p.name, p.rosterId))
            })
    })
}
