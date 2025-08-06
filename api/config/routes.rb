# For details, see: https://guides.rubyonrails.org/routing.html

Rails.application.routes.draw do
  root 'basic#home'

  get 'error', to: 'basic#error'
  get 'health', to: 'basic#health'

  # namespace api endpoints behind /v1/ just for good measure
  scope :v1 do
    resources :songs, only: [:index]
  end
end
