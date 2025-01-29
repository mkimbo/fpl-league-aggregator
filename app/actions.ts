"use server"

interface ManagerHistory {
  event: number;
  points: number;
  event_transfers_cost: number;
}

interface LeagueManager {
  entry: number;
  player_name: string;
  entry_name: string;
}

// Define a type for gameweek points that allows string keys
interface GameweekPoints {
  [key: string]: number;
}

// Define the structure for the final manager data
// interface ManagerData extends GameweekPoints {
//   name: string;
//   team_name: string;
//   total: number;
// }


export const getLeagueManagers = async (leagueId: string): Promise<LeagueManager[]> => {
  try {
    const response = await fetch(`https://fantasy.premierleague.com/api/leagues-classic/${leagueId}/standings/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.status == 200) {
    const res = await response.json()
    return res.standings.results;
    } else {
      console.error('Failed to submit data')
      return []
    }
  } catch (error) {
    console.error('An error occurred while submitting', error)
    return []
  }
}


export const getManagerHistory = async (managerId: number): Promise<ManagerHistory[]> => {
  try {
    const response = await fetch(`https://fantasy.premierleague.com/api/entry/${managerId}/history/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.status == 200) {
    const res = await response.json()
    return res.current;
    } else {
      console.error('Failed to submit data')
      return []
    }
  } catch (error) {
    console.error('An error occurred while submitting', error)
    return []
  }
}



export const getLeagueTable = async (data: { leagueId: string, startGw: number, endGw: number }): Promise<any[]> => {

  const { leagueId, startGw, endGw } = data;

  try {
    // Get all managers in the league
    const managers = await getLeagueManagers(leagueId);
    
    // Get points for each manager
    const pointsPromises = managers.map(async (manager) => {
      const history = await getManagerHistory(manager.entry);
      
      // Calculate total points for specified gameweeks
     const gwPoints: GameweekPoints = {};
      let total = 0;
      
      history.forEach(gw => {
        if (gw.event >= startGw && gw.event <= endGw) {
          const netPoints = gw.points - gw.event_transfers_cost;
          gwPoints[`GW${gw.event}`] = netPoints;
          total += netPoints;
        }
      });
      
      return {
        name: manager.player_name,
        team_name: manager.entry_name,
        ...gwPoints,
        total
      };
    });
    
    const results = await Promise.all(pointsPromises);
    
    // Sort by total points
    results.sort((a, b) => b.total - a.total);
    
    return results
  } catch (error) {
    console.error('Error:', error);
    return []
  }
}
