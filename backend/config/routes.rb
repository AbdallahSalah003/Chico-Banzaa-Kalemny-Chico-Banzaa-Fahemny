Rails.application.routes.draw do
  # Devise Auth routes
  # We map the controllers to handle JSON responses for login/signup
  devise_for :users, 
             path: '', 
             defaults: { format: :json },
             path_names: {
               sign_in: 'login',
               sign_out: 'logout',
               registration: 'signup'
             }

  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      resources :matches, only: [:index, :show, :create, :update, :destroy] do
        resources :tickets, only: [:create]
      end
      
      resources :stadiums, only: [:index, :create, :show, :destroy]
      resources :tickets, only: [:destroy, :index]
      resources :teams, only: [:index]
      patch '/users/:id/approve', to: 'users#approve'
      resources :users, only: [:index, :destroy, :update]
    end
  end
  
  #WebSocket Route 
  mount ActionCable.server => '/cable'
end