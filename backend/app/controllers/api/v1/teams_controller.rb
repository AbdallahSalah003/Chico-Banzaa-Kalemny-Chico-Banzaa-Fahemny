class Api::V1::TeamsController < ApplicationController
  before_action :authenticate_user!, except: [:index]

  # GET /api/v1/teams
  def index
    @teams = Team.all
    render json: @teams
  end
end