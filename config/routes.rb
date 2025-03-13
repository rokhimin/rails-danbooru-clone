Rails.application.routes.draw do
  
  root "home#index" 
  get '/detail/:tag/:id', to: 'tag#show_image', as: 'image_detail'
  get "/:tag" => "tag#fetch", constraints: { tag: /[^&]+/ }
  get "/:tag&page=:page" => "tag#fetch", constraints: { tag: /[^&]+/ }
  
end
