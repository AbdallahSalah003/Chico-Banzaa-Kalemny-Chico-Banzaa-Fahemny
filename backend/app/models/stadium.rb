class Stadium < ApplicationRecord
  has_many :matches
  validates :name, presence: true
  validates :rows, :seats_per_row, presence: true, numericality: { greater_than: 0 }
end
