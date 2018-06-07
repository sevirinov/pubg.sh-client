import React from 'react'
import moment from 'moment'
import { get, uniqBy, isEmpty } from 'lodash'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import styled from 'styled-components'
import MatchesList from './MatchesList.js'
import RateLimited from './RateLimited.js'

export const MatchesContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    margin-top: 4rem;
`

const PlayerHeader = styled.div`
    grid-row: 1;
    grid-column-start: 1;
    grid-column-end: 4;
    margin: 0 auto 1rem;
    text-align: center;
`

const PlayerName = styled.h3`
    text-align: center;
`

class Player extends React.Component {
    componentDidUpdate(prevProps, prevState) {
        const playerName = get(this.props, 'data.player.name')

        if (playerName) {
            const { shardId } = this.props.match.params
            const url = `${playerName}/${shardId}`

            const recentPlayers = JSON.parse(localStorage.getItem('recentPlayers') || '[]')
            recentPlayers.unshift({ playerName, shardId, url })
            localStorage.setItem('recentPlayers', JSON.stringify(uniqBy(recentPlayers, 'url').slice(0, 10)))
            localStorage.setItem('shardId', shardId)
        }
    }

    render() {
        const { match, data: { loading, error, player } } = this.props

        if (loading) return <p>Loading matches...</p>
        if (error) return <p>An error occurred :(</p>
        if (!player || (isEmpty(player.matches) && !player.rateLimitReset)) {
            return (
                <PlayerHeader>
                    <PlayerName>
                        {this.props.match.params.playerName} - {this.props.match.params.shardId}
                    </PlayerName>
                    <p>
                        Player not found. Check that:
                    </p>
                    <p>
                        You selected the correct region<br />
                        The user has played a game in the last week<br />
                        The name was typed exactly as in-game. Capitalization matters.
                    </p>
                </PlayerHeader>
            )
        }
        const forGameMode = gameMode => player.matches.filter(m => m.gameMode.includes(gameMode))

        const fetchedMinAgo = moment.utc().diff(moment.utc(player.lastFetchedAt), 'minutes')
        const friendlyAgo = moment.duration(fetchedMinAgo, 'minutes').humanize()

        return (
            <MatchesContainer>
                <PlayerHeader>
                    <PlayerName>{player.name}</PlayerName>
                    {player.rateLimitReset &&
                        <RateLimited player={player} onUnRateLimited={this.props.data.refetch} />
                    }
                    {player.lastFetchedAt &&
                        <p>(Matches last updated {friendlyAgo} ago)</p>
                    }
                </PlayerHeader>
                <MatchesList col="1" header="Solo" baseUrl={match.url} matches={forGameMode('solo')} />
                <MatchesList col="2" header="Duos" baseUrl={match.url} matches={forGameMode('duo')} />
                <MatchesList col="3" header="Squad" baseUrl={match.url} matches={forGameMode('squad')} />
            </MatchesContainer>
        )
    }
}

export default graphql(gql`
    query($shardId: String!, $playerName: String!) {
        player(shardId: $shardId, name: $playerName) {
            id
            name
            lastFetchedAt
            rateLimitReset
            rateLimitAhead
            rateLimitPlayerKey
            matches {
                id
                playedAt
                gameMode
                mapName
                durationSeconds
                stats {
                    winPlace
                    kills
                }
            }
        }
    }`, {
    options: ({ match }) => ({
        fetchPolicy: 'network-only',
        variables: {
            shardId: match.params.shardId,
            playerName: match.params.playerName,
        },
    }),
})(Player)
