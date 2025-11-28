class CreateMatches < ActiveRecord::Migration[7.2]
  def change
    create_table :matches do |t|
      t.references :home_team, null: false, foreign_key: { to_table: :teams }
      t.references :away_team, null: false, foreign_key: { to_table: :teams }
      
      t.references :stadium, null: false, foreign_key: true
      
      t.datetime :start_time
      t.string :main_referee
      t.string :linesman1
      t.string :linesman2

      t.timestamps
    end
  end
end