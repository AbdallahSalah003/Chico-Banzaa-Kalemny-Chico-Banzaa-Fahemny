import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

const ManagerDashboard = () => {
    const [teams, setTeams] = useState([]);
    const [stadiums, setStadiums] = useState([]);
    const [loading, setLoading] = useState(true);

    const [matchData, setMatchData] = useState({
        home_team_id: '',
        away_team_id: '',
        stadium_id: '',
        start_time: '',
        main_referee: '',
        linesman1: '',
        linesman2: ''
    });

    const [stadiumData, setStadiumData] = useState({
        name: '',
        rows: '',
        seats_per_row: ''
    });

    const [message, setMessage] = useState({ text: '', type: '' });

    const [matches, setMatches] = useState([]);
    const [editingMatchId, setEditingMatchId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const teamsRes = await apiClient.get('/teams');
                const stadiumsRes = await apiClient.get('/stadiums');
                const matchesRes = await apiClient.get('/matches'); // Fetch matches for list
                setTeams(teamsRes.data);
                setStadiums(stadiumsRes.data);
                setMatches(matchesRes.data);
            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleMatchChange = (e) => {
        setMatchData({ ...matchData, [e.target.name]: e.target.value });
    };

    const handleStadiumChange = (e) => {
        setStadiumData({ ...stadiumData, [e.target.name]: e.target.value });
    };

    const handleEditMatch = (match) => {
        setEditingMatchId(match.id);
        setMatchData({
            home_team_id: match.home_team_id,
            away_team_id: match.away_team_id,
            stadium_id: match.stadium_id,
            // Format for datetime-local: YYYY-MM-DDTHH:MM
            start_time: new Date(match.start_time).toISOString().slice(0, 16),
            main_referee: match.main_referee,
            linesman1: match.linesman1,
            linesman2: match.linesman2
        });
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
    };

    const cancelEdit = () => {
        setEditingMatchId(null);
        setMatchData({
            home_team_id: '',
            away_team_id: '',
            stadium_id: '',
            start_time: '',
            main_referee: '',
            linesman1: '',
            linesman2: ''
        });
    }

    const handleSubmitMatch = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        try {
            if (editingMatchId) {
                await apiClient.put(`/matches/${editingMatchId}`, { match: matchData });
                setMessage({ text: 'Match updated successfully!', type: 'success' });
                 // Update local list
                setMatches(matches.map(m => m.id === editingMatchId ? { ...m, ...matchData, id: editingMatchId } : m));
            } else {
                const resp = await apiClient.post('/matches', { match: matchData });
                setMessage({ text: 'Match created successfully!', type: 'success' });
                setMatches([...matches, resp.data]);
            }
            cancelEdit(); // Reset form
        } catch (error) {
            setMessage({ text: `Failed to ${editingMatchId ? 'update' : 'create'} match.`, type: 'error' });
            console.error(error);
        }
    };

    const createStadium = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        try {
            const resp = await apiClient.post('/stadiums', { stadium: stadiumData });
            setStadiums([...stadiums, resp.data]); // Update list
            setMessage({ text: 'Stadium created successfully!', type: 'success' });
            setStadiumData({ name: '', rows: '', seats_per_row: '' });
        } catch (error) {
            setMessage({ text: 'Failed to create stadium.', type: 'error' });
            console.error(error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container">
            <h1>Manager Dashboard</h1>
            {message.text && (
                <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`} 
                     style={{backgroundColor: message.type === 'error' ? '#f8d7da' : '#d4edda', color: message.type === 'error' ? '#721c24' : '#155724', padding: '10px', marginBottom: '20px', borderRadius: '5px'}}>
                    {message.text}
                </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="card auth-card" style={{margin: '0'}}>
                    <h2 style={{textAlign: 'center', marginBottom: '20px'}}>{editingMatchId ? 'Edit Match' : 'Create Match'}</h2>
                    <form onSubmit={handleSubmitMatch} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">Home Team</label>
                            <select name="home_team_id" value={matchData.home_team_id} onChange={handleMatchChange} required>
                                <option value="">Select Home Team</option>
                                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Away Team</label>
                            <select name="away_team_id" value={matchData.away_team_id} onChange={handleMatchChange} required>
                                <option value="">Select Away Team</option>
                                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Stadium</label>
                            <select name="stadium_id" value={matchData.stadium_id} onChange={handleMatchChange} required>
                                <option value="">Select Stadium</option>
                                {stadiums.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Start Time</label>
                            <input type="datetime-local" name="start_time" value={matchData.start_time} onChange={handleMatchChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Main Referee</label>
                            <input type="text" name="main_referee" value={matchData.main_referee} onChange={handleMatchChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Linesman 1</label>
                            <input type="text" name="linesman1" value={matchData.linesman1} onChange={handleMatchChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Linesman 2</label>
                            <input type="text" name="linesman2" value={matchData.linesman2} onChange={handleMatchChange} required />
                        </div>
                        <button type="submit" className="btn btn-primary btn-full-width">{editingMatchId ? 'Update Match' : 'Create Match'}</button>
                        {editingMatchId && <button type="button" onClick={cancelEdit} className="btn btn-secondary btn-full-width" style={{marginTop:'10px', backgroundColor:'#6c757d', color:'white'}}>Cancel Edit</button>}
                    </form>
                </div>

                <div className="card auth-card" style={{margin: '0'}}>
                    <h2 style={{textAlign: 'center', marginBottom: '20px'}}>Create Stadium</h2>
                    <form onSubmit={createStadium} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">Name</label>
                            <input type="text" name="name" value={stadiumData.name} onChange={handleStadiumChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Number of Rows</label>
                            <input type="number" name="rows" value={stadiumData.rows} onChange={handleStadiumChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Seats per Row</label>
                            <input type="number" name="seats_per_row" value={stadiumData.seats_per_row} onChange={handleStadiumChange} required />
                        </div>
                        <button type="submit" className="btn btn-primary btn-full-width">Create Stadium</button>
                    </form>
                </div>
            </div>
            
            {/* Existing Matches List */}
            <div className="card auth-card" style={{marginTop: '20px', maxWidth: '100%'}}>
                 <h2 style={{textAlign: 'center', marginBottom: '20px'}}>Existing Matches</h2>
                 <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', tableLayout: 'fixed' }}>
                        <thead>
                            <tr style={{borderBottom: '2px solid rgba(255,255,255,0.1)', textAlign: 'left'}}>
                                <th style={{padding: '12px', width: '25%'}}>Home Team</th>
                                <th style={{padding: '12px', width: '25%'}}>Away Team</th>
                                <th style={{padding: '12px', width: '20%'}}>Venue</th>
                                <th style={{padding: '12px', width: '20%'}}>Date</th>
                                <th style={{padding: '12px', width: '10%', textAlign: 'right'}}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matches.map(match => (
                                <tr key={match.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'left' }}>
                                    <td style={{padding: '12px'}}>{match.home_team?.name}</td>
                                    <td style={{padding: '12px'}}>{match.away_team?.name}</td>
                                    <td style={{padding: '12px'}}>{match.stadium?.name}</td>
                                    <td style={{padding: '12px'}}>{new Date(match.start_time).toLocaleString()}</td>
                                    <td style={{padding: '12px', textAlign: 'right'}}>
                                        <button 
                                            className="btn btn-secondary" 
                                            onClick={() => handleEditMatch(match)}
                                            style={{backgroundColor: '#f39c12', color: 'white', padding: '5px 15px', fontSize: '0.9em'}}
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {matches.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{padding: '20px', textAlign: 'center', color: '#888'}}>No matches found. Create one above.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
