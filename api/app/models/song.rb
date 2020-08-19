class Song < ApplicationRecord
  include PgSearch::Model
  # See: https://github.com/Casecommons/pg_search#pg_search_scope
  pg_search_scope :autocomplete_titles, against: :title, ignoring: :accents, using: {
    tsearch: {
      prefix: true,           # Adds support for "begins with" (rather than exact matches)
      dictionary: "english",  # Add support for stemming
      any_word: true,         # Returns result if *any* word matches (instead of all)
      highlight: {
        HighlightAll: true,
        # We use custom highlight indicators instead of "<b>" and "</b>"
        # because we need to escape any html in the titles, to guard against
        # XSS. Once the frontend does the escaping, it can then convert our
        # custom indicators to "<b>" tags.
        StartSel: "[[",
        StopSel: "]]"
      }
    }
  }

  pg_search_scope :search_by_title, against: :title, ignoring: :accents, using: {
    tsearch: {
      prefix: true,
      dictionary: "english",
      any_word: true,
      highlight: {
        HighlightAll: true,
        StartSel: "[[",
        StopSel: "]]"
      }
    }
  }
end
