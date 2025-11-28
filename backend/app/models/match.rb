class Match < ApplicationRecord
  belongs_to :home_team, class_name: 'Team'
  belongs_to :away_team, class_name: 'Team'
  belongs_to :stadium
  has_many :tickets

  validate :teams_must_be_different

  def teams_must_be_different
    errors.add(:away_team, "must be different from home team") if home_team_id == away_team_id
  end
end
