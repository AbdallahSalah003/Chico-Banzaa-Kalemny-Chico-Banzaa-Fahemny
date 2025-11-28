class CreateTickets < ActiveRecord::Migration[7.2]
  def change
    create_table :tickets do |t|
      t.references :user, null: false, foreign_key: true
      t.references :match, null: false, foreign_key: true
      t.integer :row, null: false
      t.integer :seat, null: false
      t.string :ticket_number, null: false
      t.timestamps
    end
    # this prevents double booking at the database level
    add_index :tickets, [:match_id, :row, :seat], unique: true
    add_index :tickets, :ticket_number, unique: true
  end
end
