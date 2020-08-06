# For details, see: https://guides.rubyonrails.org/routing.html

Rails.application.routes.draw do
  root 'basic#home'

  # namespace api endpoints behind /v1/ just for good measure
  scope :v1 do
    resources :songs, only: [:index]
  end
end
