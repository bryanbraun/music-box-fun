class RemoveSongdataIndex < ActiveRecord::Migration[6.0]
  def change
    remove_index :songs, column: :data
  end
end
