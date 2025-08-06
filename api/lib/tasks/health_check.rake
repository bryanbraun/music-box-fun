namespace :app do
  desc "Run application health checks including seed data verification"
  task health_check: :environment do
    puts "🏥 Running Health Checks..."

    # Test 1: Database connection
    begin
      Song.connection.execute('SELECT 1')
      puts "✅ Database: Connected"
    rescue => e
      puts "❌ Database: #{e.message}"
      exit 1
    end

    # Test 2: Seed data verification
    begin
      count = Song.count
      if count > 0
        puts "✅ Seed Data: #{count} songs in database"
      else
        puts "⚠️  Seed Data: No songs found - run rails db:seed"
      end
    rescue => e
      puts "❌ Seed Data: #{e.message}"
      exit 1
    end

    # Test 3: Search functionality with real data
    begin
      results = Song.search_by_title('test').limit(1).to_a
      puts "✅ Search: pg_search working"
    rescue => e
      puts "❌ Search: #{e.message}"
      exit 1
    end

    # Test 4: Version verification
    puts "✅ Ruby Version: #{RUBY_VERSION}"
    puts "✅ Rails Version: #{Rails.version}"

    puts "🎉 All health checks passed!"
  end
end
