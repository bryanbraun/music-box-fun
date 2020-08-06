class CreateSongs < ActiveRecord::Migration[6.0]
  def change
    create_table :songs do |t|
      t.string :title
      t.text :data

      t.timestamps
    end
    add_index :songs, :data, unique: true
  end
end
