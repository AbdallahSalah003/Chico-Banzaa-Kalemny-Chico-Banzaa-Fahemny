class Api::V1::UsersController < ApplicationController
  before_action :authenticate_user!

  # GET /api/v1/users
  def index 
    if current_user.admin? 
      @users = User.all.order(created_at: :desc)
      render json: @users 
    else 
      render json: {error: "Unauthorized"}, status: :forbidden
    end
  end

  # PATCH /api/v1/users/:id/approve
  def approve 
    if current_user.admin? 
      user = User.find(params[:id])
      if user.update(is_approved: true)
        render json: { message: "User #{user.username} approved successfully"}
      else 
        render json: { error: "Couldn't approve usr"}, status: :unprocessable_entity
      end 
    else 
      render json: { error: "Unauthorized" }, status: :forbidden
    end 
  end

  # DELETE /api/v1/users/:id
  def destroy 
    if current_user.admin? 
      user = User.find(params[:id])
      user.destroy
      render json: {message: "User account deleted"}
    else 
      render json: { error: "Unauthorrized"}, status: :forbidden
    end 
  end 
end