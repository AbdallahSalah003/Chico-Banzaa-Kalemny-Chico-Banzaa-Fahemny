# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
admin = User.create!(
  username: "admin_master",
  email: "admin@efa.eg",
  password: "password123",
  first_name: "Ali",
  last_name: "Admin",
  birth_date: "1970-01-31",
  gender: "Male",
  city: "Cairo",
  role: :admin,
  is_approved: true
)

teams = [
  "Al Ahly", "Zamalek", "Pyramids", "Future FC", "Smouha", 
  "Al Ittihad", "Al Masry", "Enppi", "Zed FC", 
  "Bank Al Ahly", "Ceramica Cleopatra", "Ismaily", "Ghazl El Mahalla",
  "Aswan", "Wadi Degla", "El Dakhleya", "Pharco FC", "Al Mokawloon"
]

teams.each do |team_name|
  Team.find_or_create_by!(name: team_name)
end

Stadium.create!(
  name: "Cairo International Stadium",
  rows: 50,
  seats_per_row: 50
)
puts "Doneeee"