class Api::V1::TicketsController < ApplicationController
  before_action :authenticate_user!

  def create
    ActiveRecord::Base.transaction do
      @match = Match.find(params[:match_id])
      if Ticket.exists?(match: @match, row: params[:row], seat: params[:seat])
        render json: {error: "Seat is already reserved" }, status: :conflict
        return 
      end
      @ticket = Ticket.create!(
        user: current_user,
        match: @match,
        row: params[:row],
        seat: params[:seat],
        ticket_number: SecureRandom.uuid 
      )
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
      @ticket.destroy
      render json: {message: "Reservation cancelled successfully"}
    else
      render json: {error: "Can't cancel less than 3 days before match"}, status: :forbidden
    end
  end

  
end
