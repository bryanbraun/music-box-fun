class AddDefaultsAndTimezoneToSongs < ActiveRecord::Migration[7.2]
  def change
    change_column :songs, :created_at, :datetime, precision: 6, null: false, default: -> { 'now()' }
    change_column :songs, :updated_at, :datetime, precision: 6, null: false, default: -> { 'now()' }
    
    # Convert timestamp to timestamptz
    execute <<-SQL
      ALTER TABLE songs
      ALTER COLUMN created_at TYPE timestamp with time zone USING created_at AT TIME ZONE 'UTC',
      ALTER COLUMN updated_at TYPE timestamp with time zone USING updated_at AT TIME ZONE 'UTC';
    SQL
  end
end
