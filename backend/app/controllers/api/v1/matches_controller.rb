class Api::V1::MatchesController < ApplicationController
  # anyone can view matches but only managers or admins can create/edit
  before_action :authenticate_user!, except: [:index, :show]

  def index
    @matches=Match.includes(:home_team, :away_team, :stadium).all
    render json: @matches, include: ['home_team','away_team','stadium']
  end
  def show
    @match = Match.find(params[:id])
    @team1 = Team.find(@match.home_team_id)
    @team2 = Team.find(@match.away_team_id)
    #allowing sami draw the red/green boxes
    reserved_seats = @match.tickets.select(:row, :seat, :id)
    render json: {
      match: @match,
      stadium: @match.stadium,
      reserved_seats: reserved_seats,
      home_team: @team1,
      away_team: @team2
    }
  end
  def create
    unless (current_user.manager? || current_user.admin?) && (current_user.is_approved)
      return render json: { error: "Unauthorized" }, status: :forbidden
    end

    @match = Match.new(match_params)
    if @match.save
      render json: @match, status: :created
    else
      render json: { errors: @match.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    unless (current_user.manager? || current_user.admin?) && (current_user.is_approved)
      return render json: { error: "Unauthorized" }, status: :forbidden
    end

    @match = Match.find(params[:id])
    if @match.destroy
      render json: { message: "Match with id:#{@match.id} deleted successfully"}, status: :no_content
    else
      render json: { errors: @match.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update 
    unless (current_user.manager? || current_user.admin?) && (current_user.is_approved)
      return render json: { error: "Unauthorized" }, status: :forbidden
    end

    @match = Match.find(params[:id])
    if @match.update(match_params)
      render json: @match
    else
      render json: { errors: @match.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private
  def match_params
    params.require(:match).permit(:home_team_id, :away_team_id, :stadium_id, :start_time, :main_referee, :linesman1, :linesman2)
  end
end
