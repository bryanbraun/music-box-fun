class SongsController < ApplicationController

  def index
    # Allow requests to be cached at cloudflare unless they expire
    # or are are manually purged.
    expires_in 7.days, public: true, must_revalidate: true

    # Extract optional query params for search. See
    # https://stackoverflow.com/a/1081720/1154642
    query_param = params[:q]
    search_all_param = params[:searchAll]

    if !query_param
      # For non-search requests, return the 150 most recent songs
      result = Song.order(created_at: :desc)
      render json: result.limit(150).as_json(only: [:title, :data, :creator, :creator_url])
    elsif search_all_param == "true"
      # For search-results-page requests
      result = Song.search_by_title(query_param).with_pg_search_highlight
      render json: result.limit(150).as_json(only: [:pg_search_highlight, :data, :creator, :creator_url])
    else
      # For autocomplete-style requests
      result = Song.autocomplete_titles(query_param).with_pg_search_highlight
      render json: result.limit(50).as_json(only: [:pg_search_highlight, :data, :creator, :creator_url])
    end
  end
end

