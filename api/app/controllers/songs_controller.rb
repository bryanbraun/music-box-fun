class SongsController < ApplicationController

  def index
    search_param = params[:q]

    # if it's a search query, search for the right song
    # https://stackoverflow.com/a/1081720/1154642
    if search_param
      render json: { query: search_param }
    else
      # If it's not a search, return the 20 most recent songs
      render json: Song.order(created_at: :desc).limit(20).as_json(only: [:title, :data])
    end
  end
end

