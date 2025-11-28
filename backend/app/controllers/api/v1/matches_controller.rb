class Api::V1::MatchesController < ApplicationController
  # anyone can view matches but only managers or admins can create/edit
  before_action :authenticate_user!, except: [:index, :show]

  def index
    @matches=Match.includes(:home_team, :away_team, :stadium).all
    render json: @matches, include: ['home_team','away_team','stadium']
  end
  def show
    @match = Match.find(params[:id])
    #allowing sami draw the red/green boxes
    reserved_seats = @match.tickets.select(:row, :seat)
    render json: {
      match: @match,
      stadium: @match.stadium,
      reserved_seats: reserved_seats
    }
  end
  def create
    unless current_user.manager? || current_user.admin?
      return render json: { error: "Unauthorized" }, status: :forbidden
    end

    @match = Match.new(match_params)
    if @match.save
      render json: @match, status: :created
    else
      render json: { errors: @match.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private
  def match_params
    params.require(:match).permit(:home_team_id, :away_team_id, :stadium_id, :start_time, :main_referee, :linesman1, :linesman2)
  end
end
