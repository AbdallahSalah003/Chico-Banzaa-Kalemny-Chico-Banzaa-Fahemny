class Ticket < ApplicationRecord
  belongs_to :user
  belongs_to :match
  validates :row, :seat, presence: true
  validates :ticket_number, uniqueness: true
  validate :seat_within_bounds
  private
  def seat_within_bounds
    return unless match && row && seat 
    stadium = match.stadium
    if row > stadium.rows || seat > stadium.seats_per_row
      errors.add(:base, "Seat does not exist in this stadium")
    end
  end
end
