class Api::V1::UsersController < ApplicationController
  before_action :authenticate_user!

  # GET /api/v1/users
  def index 
    if (current_user.admin?) && (current_user.is_approved?)
      @users = User.all.order(created_at: :desc)
      render json: @users 
    else 
      render json: {error: "Unauthorized"}, status: :forbidden
    end
  end

  # PATCH /api/v1/users/:id/approve
  def approve 
    if (current_user.admin?) && (current_user.is_approved?)
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
    unless current_user.is_approved?
      return render json: { error: "Your account is pending approval." }, status: :forbidden
    end
    if (current_user.admin?) && (current_user.is_approved?)
      user = User.find(params[:id])
      user.destroy
      render json: {message: "User account deleted"}
    else 
      render json: { error: "Unauthorrized"}, status: :forbidden
    end 
  end 

  def update 
    unless current_user.is_approved?
      return render json: { error: "Your account is pending approval." }, status: :forbidden
    end
    user = User.find(params[:id])
    if current_user.id == user.id || current_user.admin? 
      if user.update(user_update_params)
        render json: { message: "Profile updateed succeessfully", user: user}
      else 
        render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
      end
    else 
      render json: {error: "You aren't authorized for this edits"}, status: :forbidden
    end 
  end 
  private 
  def user_update_params
    params.require(:user).permit(
      :first_name, :last_name, :birth_date,
      :gender, :city, :address
    )
  end
end