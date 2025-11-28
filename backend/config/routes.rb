Rails.application.routes.draw do
  # Devise Auth routes
  # We map the controllers to handle JSON responses for login/signup
  devise_for :users, 
             path: '', 
             path_names: {
               sign_in: 'login',
               sign_out: 'logout',
               registration: 'signup'
             },
             controllers: {
               sessions: 'users/sessions',
               registrations: 'users/registrations'
             }

  namespace :api do
    namespace :v1 do
      resources :matches, only: [:index, :show, :create, :update]
      resources :stadiums, only: [:index, :create]
      
      resources :tickets, only: [:create, :destroy]
      
      patch '/users/:id/approve', to: 'users#approve'
      resources :users, only: [:index, :destroy]
    end
  end
  
  #WebSocket Route 
  mount ActionCable.server => '/cable'
end