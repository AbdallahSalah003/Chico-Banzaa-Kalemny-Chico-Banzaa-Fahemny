class Api::V1::StadiumsController < ApplicationController
  before_action :authenticate_user!

  # GET /api/v1/stadiums
  def index 
    @stadiums = Stadium.all
    render json: @stadiums 
  end 

  # POST /api/v1/stadiums 
  def create 
    unless current_user.manager? || current_user.admin? 
      return render json: {error: "Unauthoized"}, status: :forbidden
    end 

    @stadium = Stadium.new(stadium_params)
    if @stadium.save 
      render json: @stadium, status: :created 
    else 
      render json: { errors: @stadium.errors.full_messages }, status: :unprocessable_entity
    end 
  end
  
  private 
  def stadium_params 
    params.require(:stadium).permit(:name, :rows, :seats_per_row) 
  end 
end

