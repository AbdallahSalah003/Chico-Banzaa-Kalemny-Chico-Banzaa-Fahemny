class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :validatable, :jwt_authenticatable, jwt_revocation_strategy: Devise::JWT::RevocationStrategies::Null
  enum role: { fan: 0, manager: 1, admin: 2 }
  has_many :tickets
  validates :username, presence: true, uniqueness: true
  validates :first_name, :last_name, :birth_date, :gender, :city, :role, presence: true
end
