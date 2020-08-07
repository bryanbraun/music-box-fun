class Song < ApplicationRecord
  include PgSearch::Model
  # See: https://github.com/Casecommons/pg_search#pg_search_scope
  pg_search_scope :search_by_title_fulltext, against: :title, using: [:tsearch]

  # pg_search_scope :search_by_title_trigram, against: :title, using: [:trigram]

end
