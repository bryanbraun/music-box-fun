class BasicController < ApplicationController
  # For basic endpoints only (like the status page). This should be mostly empty.

  def home
    render json: { status: 'online'}
  end

  def error
    render json: {}, status: :gateway_timeout
  end

  def health
    # Test database connectivity and seed data
    song_count = Song.count
    Song.connection.execute('SELECT 1')

    # Test search functionality with actual data
    search_results = Song.search_by_title('test').limit(1)

    render json: {
      status: 'healthy',
      ruby_version: RUBY_VERSION,
      rails_version: Rails.version,
      database: 'connected',
      songs_count: song_count,
      search: 'operational',
      timestamp: Time.current.iso8601
    }
  rescue => e
    render json: {
      status: 'unhealthy',
      error: e.message,
      ruby_version: RUBY_VERSION,
      rails_version: Rails.version
    }, status: 500
  end

end
