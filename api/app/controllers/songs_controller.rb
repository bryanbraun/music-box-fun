class SongsController < ApplicationController
  def index
    # Allow requests to be cached at cloudflare unless they expire or are are manually purged.
    expires_in 7.days, public: true, must_revalidate: true

    # Extract params for search
    query_param = params[:q]
    offset = (params[:offset] || 0).to_i
    songs_per_page = (params[:limit] || 150).to_i

    if query_param
      # For search requests, use pg_search to return matching songs with pagination data.
      # This can be used by both autocomplete and search results pages.
      full_result = Song.search_by_title(query_param).with_pg_search_highlight
      filtered_song_data = full_result.limit(songs_per_page).offset(offset).as_json(only: [:pg_search_highlight, :data, :creator, :creator_url])
      next_page_link = "/v1/songs?q=#{query_param}&offset=#{offset + songs_per_page}&limit=#{songs_per_page}"
    else
      # For non-search requests, return recent songs with pagination data
      full_result = Song.order(created_at: :desc)
      filtered_song_data = full_result.limit(songs_per_page).offset(offset).as_json(only: [:title, :data, :creator, :creator_url])
      next_page_link = "/v1/songs?offset=#{offset + songs_per_page}&limit=#{songs_per_page}"
    end

    total = full_result.size
    has_next_page = total > offset + songs_per_page

    render json: {
      songs: filtered_song_data,
      # metadata for pagination
      meta: {
        total: total,
        offset: offset,
        limit: songs_per_page,
        next: has_next_page ? next_page_link : nil
      }
    }
  end
end

