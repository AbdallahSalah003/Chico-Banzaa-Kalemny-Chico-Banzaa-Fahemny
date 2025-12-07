import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/client';
import { useCable } from '../contexts/CableContext';
import { useAuth } from '../contexts/AuthContext';

const MatchDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const cable = useCable();
    const [match, setMatch] = useState(null);
    const [reservedSeats, setReservedSeats] = useState(new Set()); // Set of "row-seat" strings
    const [selectedSeats, setSelectedSeats] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [paymentData, setPaymentData] = useState({ number: '', pin: '' });
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Fetch initial data
    useEffect(() => {
        const fetchMatch = async () => {
            try {
                const response = await apiClient.get(`/matches/${id}`);
                setMatch({ ...response.data.match, stadium: response.data.stadium });
                // reserved_seats comes as array of objects {row, seat, id}
                const reservedSet = new Set(
                    response.data.reserved_seats.map(s => `${s.row}-${s.seat}`)
                );
                setReservedSeats(reservedSet);
            } catch (error) {
                console.error("Error fetching match", error);
                setMessage({ text: 'Error loading match details', type: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchMatch();
    }, [id]);

    // WebSocket Subscription
    useEffect(() => {
        if (!cable) return;

        const channel = cable.subscriptions.create(
            { channel: 'MatchChannel', match_id: id },
            {
                received: (data) => {
                    if (data.type === 'seat_booked') {
                        setReservedSeats(prev => {
                            const newSet = new Set(prev);
                            newSet.add(`${data.row}-${data.seat}`);
                            return newSet;
                        });
                        // If I had this selected, unselect it
                        setSelectedSeats(prev => {
                             const newSelected = new Set(prev);
                             if(newSelected.has(`${data.row}-${data.seat}`)) {
                                 newSelected.delete(`${data.row}-${data.seat}`);
                                 // Maybe show a toast that "Selected seat was just taken"
                             }
                             return newSelected;
                        })
                    } else if (data.type === 'seat_canceled') {
                        setReservedSeats(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(`${data.row}-${data.seat}`);
                            return newSet;
                        });
                    }
                }
            }
        );

        return () => {
            channel.unsubscribe();
        };
    }, [cable, id]);

    const toggleSeat = (row, seat) => {
        if(!user) {
             setMessage({ text: 'Please login to view/reserve seats.', type: 'error' });
             return;
        }
        if (user.role === 'manager') {
            setMessage({ text: 'Managers are in View-Only mode.', type: 'info' });
            return;
        }
        if (user.role !== 'fan') {
             setMessage({ text: 'Only fans can reserve seats.', type: 'error' });
             return;
        }
        const key = `${row}-${seat}`;
        if (reservedSeats.has(key)) return;

        setSelectedSeats(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) newSet.delete(key);
            else newSet.add(key);
            return newSet;
        });
    };

    const handleReservation = async () => {
        // Here we loop through selected seats and create tickets
        // The endpoint takes one ticket at a time based on ticket_params
        // This might be slow for many seats, but backend seems designed for single ticket create or I loop.
        // User requirements say "Reserve vacant seat/s", implying multiple.
        
        try {
            const promises = Array.from(selectedSeats).map(seatKey => {
                const [row, seat] = seatKey.split('-').map(Number);
                return apiClient.post(`/matches/${id}/tickets`, {
                    ticket: {
                        row,
                        seat,
                        credit_card_number: paymentData.number,
                        pin: paymentData.pin
                    }
                });
            });

            await Promise.all(promises);
            setMessage({ text: 'Reservation Successful!', type: 'success' });
            setSelectedSeats(new Set());
            setShowPaymentModal(false);
            setPaymentData({ number: '', pin: '' });
        } catch (error) {
            console.error("Reservation failed", error);
            // Some might have failed, some succeeded. 
            // Ideally backend supports batch or we handle partial failure.
            // For now assume all or nothing or just show error.
            setMessage({ text: 'Some reservations failed. Please check your tickets.', type: 'error' });
            setShowPaymentModal(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!match) return <div>Match not found</div>;

    const stadium = match.stadium;
    if (!stadium) return <div>Stadium info missing</div>;

    return (
        <div className="container">
            <div className="card">
                <h2>{match.home_team?.name} vs {match.away_team?.name}</h2>
                <p><strong>Venue:</strong> {stadium.name}</p>
                <p><strong>Date:</strong> {new Date(match.start_time).toLocaleString()}</p>
            </div>

            {message.text && (
                <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`} style={{padding:'10px', marginBottom: '10px', backgroundColor: message.type==='error'?'#f8d7da':'#d4edda', color: message.type==='error'?'#721c24':'#155724'}}>
                    {message.text}
                </div>
            )}

            {user && (user.role === 'fan' || user.role === 'manager') ? (
                <div className="card auth-card" style={{margin: '0 auto', maxWidth: '800px'}}>
                    <h3 style={{textAlign: 'center', marginBottom: '20px', color: 'var(--accent-blue)'}}>Select Seats</h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${stadium.seats_per_row}, 30px)`,
                        gap: '8px',
                        justifyContent: 'center',
                        marginTop: '20px',
                        overflowX: 'auto',
                        padding: '20px',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '12px'
                    }}>
                        {Array.from({ length: stadium.rows }).map((_, r) => (
                            Array.from({ length: stadium.seats_per_row }).map((_, s) => {
                                const row = r + 1;
                                const seat = s + 1;
                                const key = `${row}-${seat}`;
                                const isReserved = reservedSeats.has(key);
                                const isSelected = selectedSeats.has(key);
                                
                                let bgColor = 'rgba(255, 255, 255, 0.1)'; // Glassy Grey (Vacant)
                                if (isReserved) bgColor = 'var(--accent-red)'; // Red (Reserved)
                                else if (isSelected) bgColor = 'var(--accent-green)'; // Green (Selected)

                                return (
                                    <div
                                        key={key}
                                        onClick={() => toggleSeat(row, seat)}
                                        title={`Row ${row}, Seat ${seat}`}
                                        style={{
                                            width: '30px',
                                            height: '30px',
                                            backgroundColor: bgColor,
                                            borderRadius: '8px',
                                            border: isSelected ? '2px solid #fff' : '1px solid rgba(255,255,255,0.05)',
                                            boxShadow: isSelected ? '0 0 10px var(--accent-green)' : 'none',
                                            cursor: isReserved ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff',
                                            fontSize: '0.7em',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {/* {seat} */}
                                    </div>
                                );
                            })
                        ))}
                    </div>
                    
                    <div style={{marginTop: '20px', textAlign: 'center'}}>
                        <div style={{display:'inline-flex', gap:'20px'}}>
                            <div style={{display:'flex', alignItems:'center', color: 'var(--text-muted)'}}><div style={{width:'20px', height:'20px', backgroundColor:'rgba(255, 255, 255, 0.1)', marginRight:'8px', borderRadius: '4px'}}></div> Vacant</div>
                            <div style={{display:'flex', alignItems:'center', color: 'var(--text-main)'}}><div style={{width:'20px', height:'20px', backgroundColor:'var(--accent-green)', marginRight:'8px', borderRadius: '4px', boxShadow: '0 0 5px var(--accent-green)'}}></div> Selected</div>
                            <div style={{display:'flex', alignItems:'center', color: 'var(--text-main)'}}><div style={{width:'20px', height:'20px', backgroundColor:'var(--accent-red)', marginRight:'8px', borderRadius: '4px', boxShadow: '0 0 5px var(--accent-red)'}}></div> Reserved</div>
                        </div>
                    </div>

                    {selectedSeats.size > 0 && (
                        <div style={{marginTop: '30px', textAlign: 'center'}}>
                             <p style={{marginBottom: '15px', fontSize: '1.2rem'}}>{selectedSeats.size} seat(s) selected</p>
                             <button className="btn btn-primary" onClick={() => setShowPaymentModal(true)} style={{padding: '12px 30px', fontSize: '1.1rem'}}>
                                 Proceed to Reserve
                             </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="alert alert-info" style={{textAlign: 'center', maxWidth: '600px', margin: '20px auto'}}>
                    {user ? "Detailed seating chart is available for Fans only." : "Please login as a Fan to reserve seats."}
                    {!user && <div style={{marginTop: '15px'}}><a href="/login" className="btn btn-primary">Login Now</a></div>}
                </div>
            )}

            {showPaymentModal && (
                <div style={{
                    position: 'fixed', top:0, left:0, right:0, bottom:0, 
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
                    justifyContent:'center', alignItems:'center', zIndex: 1000
                }}>
                    <div className="card" style={{width: '400px'}}>
                        <h3>Confirm Reservation</h3>
                        <p>Enter payment details to reserve {selectedSeats.size} seat(s).</p>
                        <form onSubmit={(e) => { e.preventDefault(); handleReservation(); }}>
                             <div className="form-group">
                                <label>Credit Card Number</label>
                                <input 
                                    type="text" 
                                    value={paymentData.number} 
                                    onChange={e => setPaymentData({...paymentData, number: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>PIN</label>
                                <input 
                                    type="password" 
                                    value={paymentData.pin} 
                                    onChange={e => setPaymentData({...paymentData, pin: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div style={{display:'flex', justifyContent:'space-between'}}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowPaymentModal(false)} style={{backgroundColor:'#95a5a6', color:'white'}}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Pay & Reserve</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MatchDetails;
