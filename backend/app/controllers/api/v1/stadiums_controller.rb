class Api::V1::StadiumsController < ApplicationController
  before_action :authenticate_user!, except: [:index, :show]

  # GET /api/v1/stadiums
  def index 
    @stadiums = Stadium.all
    render json: @stadiums 
  end 

  # GET /api/v1/stadiums/:id
  def show 
    @stadium = Stadium.find(params[:id])
    render json: @stadium 
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

  def destroy
    unless current_user.manager? || current_user.admin? 
      return render json: {error: "Unauthoized"}, status: :forbidden
    end 
    @stadium = Stadium.find(params[:id])
    return render json: { error: "Stadium not found" }, status: :not_found unless @stadium
    if @stadium.destroy
      render json: { message: "Stadium deleted successfully" }, status: :no_content
    else
      render json: { errors: @stadium.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  private 
  def stadium_params 
    params.require(:stadium).permit(:name, :rows, :seats_per_row) 
  end 
end

