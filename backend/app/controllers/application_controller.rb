class ApplicationController < ActionController::API
  include ActionController::Flash

  respond_to :json
  
  #this make sure Devise accepts our custom fields
  before_action :configure_permitted_parameters, if: :devise_controller?

  protected
  def configure_permitted_parameters
    #allow these fields during signup
    devise_parameter_sanitizer.permit(:sign_up, keys: [
      :username, :first_name, :last_name, :birth_date, 
      :gender, :city, :address, :role
    ])
    
    # allow fields during profile Update
    devise_parameter_sanitizer.permit(:account_update, keys: [
      :first_name, :last_name, :birth_date, :gender, 
      :city, :address
    ])
  end
end
