import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';

const MyTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await apiClient.get('/tickets');
            setTickets(response.data);
        } catch (error) {
            console.error("Error fetching tickets", error);
        } finally {
            setLoading(false);
        }
    };

    const [cancelTicketId, setCancelTicketId] = useState(null);
    const [isCanceling, setIsCanceling] = useState(false);

    const initiateCancel = (id) => {
        setCancelTicketId(id);
    }

    const confirmCancel = async (ticketId) => {
        setIsCanceling(true);
        try {
            await apiClient.delete(`/tickets/${ticketId}`);
            setTickets(prev => prev.filter(t => t.id !== ticketId));
            setCancelTicketId(null);
        } catch (error) {
            console.error("Cancel failed", error);
            // Handle specific backend error message
            const errMsg = error.response?.data?.error || "Failed to cancel ticket. Use console for details or check if match is in the past.";
            alert(errMsg);
        } finally {
            setIsCanceling(false);
        }
    };

    if (loading) return <div>Loading tickets...</div>;

    return (
        <div className="container">
            <h1>My Tickets</h1>
            {tickets.length === 0 ? <p>No tickets found.</p> : (
                <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                    {tickets.map(ticket => (
                        <div key={ticket.id} className="card" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <div>
                                <h3>{ticket.match?.home_team?.name} vs {ticket.match?.away_team?.name}</h3>
                                <p><strong>Venue:</strong> {ticket.match?.stadium?.name}</p>
                                <p><strong>Date:</strong> {ticket.match ? new Date(ticket.match.start_time).toLocaleString() : 'N/A'}</p>
                                <p><strong>Seat:</strong> Row {ticket.row}, Box {ticket.seat}</p>
                                <p><strong>Ticket #:</strong> {ticket.ticket_number}</p>
                            </div>
                            <div>
                                <button className="btn btn-danger" onClick={() => initiateCancel(ticket.id)} disabled={isCanceling && cancelTicketId === ticket.id} style={{opacity: isCanceling && cancelTicketId === ticket.id ? 0.7 : 1}}>
                                    {isCanceling && cancelTicketId === ticket.id ? 'Canceling...' : 'Cancel Reservation'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Cancel Confirmation Modal */}
            {cancelTicketId && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '400px', backgroundColor: '#222', border: '1px solid #444' }}>
                        <h3 style={{color: 'white'}}>Confirm Cancellation</h3>
                        <p style={{color: '#ccc', margin: '15px 0'}}>
                            Are you sure you want to cancel this reservation? Action is irreversible.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => setCancelTicketId(null)}
                                style={{backgroundColor: '#666', color: 'white'}}
                            >
                                Keep Ticket
                            </button>
                            <button 
                                className="btn btn-danger" 
                                onClick={() => confirmCancel(cancelTicketId)}
                            >
                                Confirm Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyTickets;
