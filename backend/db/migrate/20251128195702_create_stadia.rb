class CreateStadia < ActiveRecord::Migration[7.2]
  def change
    create_table :stadia do |t|
      t.string :name
      t.integer :rows
      t.integer :seats_per_row

      t.timestamps
    end
  end
end
