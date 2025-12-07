import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';

const Home = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                // Assuming GET /matches returns list of matches
                const response = await apiClient.get('/matches');
                setMatches(response.data);
            } catch (error) {
                console.error("Error fetching matches", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, []);

    return (
        <div className="container">
            <h1>Upcoming Matches</h1>
            {loading ? (
                <p>Loading matches...</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {matches.map(match => (
                        <div key={match.id} className="card" style={{ 
                            position: 'relative', 
                            overflow: 'hidden',
                            borderLeft: '4px solid var(--accent-blue)',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease' 
                        }}>
                            <h3 style={{ 
                                fontSize: '1.5rem', 
                                marginBottom: '15px', 
                                borderBottom: '1px solid rgba(255,255,255,0.1)', 
                                paddingBottom: '10px' 
                            }}>
                                <span style={{color: 'var(--accent-blue)'}}>{match.home_team?.name}</span>
                                <span style={{margin: '0 10px', fontSize: '0.8em', color: 'var(--text-muted)'}}>VS</span>
                                <span style={{color: 'var(--accent-green)'}}>{match.away_team?.name}</span>
                            </h3>
                            <p style={{marginBottom: '8px', display: 'flex', alignItems: 'center'}}>
                                <span style={{color: 'var(--accent-blue)', marginRight: '8px'}}>📍</span> 
                                {match.stadium?.name}
                            </p>
                            <p style={{marginBottom: '15px', display: 'flex', alignItems: 'center'}}>
                                <span style={{color: 'var(--accent-blue)', marginRight: '8px'}}>📅</span> 
                                {new Date(match.start_time).toLocaleString(undefined, {
                                    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', 
                                    hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                             <Link to={`/matches/${match.id}`} className="btn btn-primary" style={{
                                 display: 'block', 
                                 textAlign: 'center', 
                                 textDecoration: 'none',
                                 marginTop: 'auto'
                             }}>
                                 View Details
                             </Link>
                        </div>
                    ))}
                    {matches.length === 0 && <p>No matches scheduled.</p>}
                </div>
            )}
        </div>
    );
};

export default Home;
