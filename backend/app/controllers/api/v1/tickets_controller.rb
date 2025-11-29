class Api::V1::TicketsController < ApplicationController
  before_action :authenticate_user!

  def index 
    @tickets = current_user.tickets.includes(match: [:home_team, :away_team, :stadium]).order(created_at: :desc)
    render json: @tickets.as_json(
      include: {
        match: {
          only: [:start_time, :id],
          include: {
            home_team: { only: [:name]},
            away_team: { only: [:name]},
            stadium: { only: [:namee]}
          }
        }
      }
    )
  end
  def create
    ActiveRecord::Base.transaction do
      @match = Match.find(params[:match_id])
      row_num = ticket_params[:row]
      seat_num = ticket_params[:seat]
      if Ticket.exists?(match: @match, row: row_num, seat: seat_num)
        render json: {error: "Seat is already reserved" }, status: :conflict
        return 
      end
      @ticket = Ticket.create!(
        user: current_user,
        match: @match,
        row: row_num,
        seat: seat_num,
        ticket_number: SecureRandom.uuid 
      )
      # edelo red ya sami 
      ActionCable.server.broadcast("match_#{@match.id}", {
        type: 'seat_booked', 
        row: @ticket.row, 
        seat: @ticket.seat, 
        ticket_id: @ticket.id 
      })
      render json: {message: "Reservation Successful", ticket: @ticket }, status: :created 
    end
  rescue ActiveRecord::RecordInvalid => e # handle validation errs like out of bound seaats
    render json: {error: e.record.errors.full_messages }, status: :unprocessable_entity
  rescue StandardError => e # all other errs
    render json: { error: e.message }, status: :bad_request
  end

  def destroy 
    @ticket = current_user.tickets.find(params[:id])
    if @ticket.match.start_time > 3.days.from_now
      match_id = @ticket.match_id 
      row = @ticket.row 
      seat = @ticket.seat 
      @ticket.destroy
      # edelo green ya samiii
      ActionCable.server.broadcast("match_#{match_id}", {
        type: 'seat_canceled', 
        row: row, 
        seat: seat 
      })
      render json: {message: "Reservation cancelled successfully"}
    else
      render json: {error: "Can't cancel less than 3 days before match"}, status: :forbidden
    end
  end

  private
  def ticket_params
    params.require(:ticket).permit(:row, :seat, :credit_card_number, :pin)
  end
  
end
