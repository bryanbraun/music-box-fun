class SongsController < ApplicationController

  def index
    search_param = params[:q]

    # if it's a search query, search for the right song
    # https://stackoverflow.com/a/1081720/1154642
    if search_param
      result = Song.search_by_title_fulltext(search_param)
      render json: result
    else
      # If it's not a search, return the 100 most recent songs
      render json: Song.order(created_at: :desc).limit(100).as_json(only: [:title, :data])
    end
  end
end

