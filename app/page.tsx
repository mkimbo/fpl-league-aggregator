"use client"
import { useState } from 'react';
import {getLeagueTable} from './actions'

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [gameweeks, setGameweeks] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target);
    const leagueId = formData.get('leagueId');
    const startGw = parseInt(formData.get('startGw'));
    const endGw = parseInt(formData.get('endGw'));

    try {
      const response = await getLeagueTable({ leagueId, startGw, endGw }) 

      
      const result = response;
      setData(result);
      
      // Generate gameweek columns
      const gws = [];
      for (let gw = startGw; gw <= endGw; gw++) {
        gws.push(`GW${gw}`);
      }
      setGameweeks(gws);
    } catch (error) {
      alert('Error fetching data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Wanyamwezi Master League Aggregator</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <form onSubmit={handleSubmit} className="flex gap-4 flex-wrap">
            <div>
              <label className="block text-sm font-medium mb-1">League ID</label>
              <input
                type="number"
                name="leagueId"
                defaultValue="1641599"
                required
                className="border rounded px-3 py-2 pointer-events-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Gameweek</label>
              <input
                type="number"
                name="startGw"
                min="1"
                max="38"
                required
                className="border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Gameweek</label>
              <input
                type="number"
                name="endGw"
                min="1"
                max="38"
                required
                className="border rounded px-3 py-2"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
              >
                {loading ? 'Loading...' : 'Get Points Table'}
              </button>
            </div>
          </form>
        </div>

        {loading && (
          <div className="text-center text-gray-600">
            Loading data...
          </div>
        )}

        {data && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Team Name</th>
                  {gameweeks.map(gw => (
                    <th key={gw} className="px-4 py-2 text-center">{gw}</th>
                  ))}
                  <th className="px-4 py-2 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 border-t">{row.name}</td>
                    <td className="px-4 py-2 border-t">{row.team_name}</td>
                    {gameweeks.map(gw => (
                      <td key={gw} className="px-4 py-2 border-t text-center">
                        {row[gw] || '-'}
                      </td>
                    ))}
                    <td className="px-4 py-2 border-t text-center font-bold">
                      {row.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
