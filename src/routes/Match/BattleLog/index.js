import React from 'react'
import styled from 'styled-components'

const DeathLogWrapper = styled.div`
    display: grid;
    grid-template-columns: 170px 1fr 170px;
    position: relative;
    margin: 3px 10px;
`

const ActivePlayer = styled.div`
    grid-column: 1;
    position: relative;
`
const PlayerInteractions = styled.ul`
    grid-column: 2;
    position: relative;
`
const Images = styled.img`
    position: relative;
    width: 100%;
`
const Interaction = styled.li`
    position: relative;
    border: 1px solid black;
    width: 100%;
`


const getItemAsset = item => require(`../../../assets/${item}.png`) // eslint-disable-line

const BattleLog = ({ telemetry, player }) => {
    return (
        <DeathLogWrapper>
            <ActivePlayer>
                <Images
                    src={getItemAsset(player.get('helmet') ? player.get('helmet') : 'Item_Head_E_00_Lv1_C')}
                    alt="Helmet"
                />
                <Images
                    src={getItemAsset(player.get('vest') ? player.get('vest') : 'Item_Armor_E_00_Lv1_C')}
                    alt="Vest"
                />
            </ActivePlayer>
            <PlayerInteractions>
                {telemetry.get('playerInteractions').map(p =>
                    <Interaction>
                        {p.getIn(['attacker', 'name'])}
                         hit {p.getIn(['victim', 'name'])}
                         for {p.get('damage')} damage
                         with {p.get('damageCauserName')}
                    </Interaction>
                )}
            </PlayerInteractions>
        </DeathLogWrapper>
    )
}

export default BattleLog
