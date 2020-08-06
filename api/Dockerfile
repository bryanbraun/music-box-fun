# Dockerfile based on the one at http://chrisstump.online/2016/02/20/docker-existing-rails-application/

# Base our image on this: https://hub.docker.com/_/ruby/
FROM ruby:2.7.1

# Install essential Linux packages
RUN apt-get update -qq && apt-get install -y build-essential postgresql-client

# Define where our application will live inside the image
ENV RAILS_ROOT /var/www/musicboxfun

# Create application home. App server will need the pids dir so just create everything in one shot
RUN mkdir -p $RAILS_ROOT/tmp/pids

# Set our working directory inside the image
WORKDIR $RAILS_ROOT

# Use the Gemfiles as Docker cache markers. Always bundle before copying app src.
# (the src likely changed and we don't want to invalidate Docker's cache too early)
# http://ilikestuffblog.com/2014/01/06/how-to-skip-bundle-install-when-deploying-a-rails-app-to-docker/
COPY Gemfile Gemfile
COPY Gemfile.lock Gemfile.lock

# Update rubygems to 3.0.0 to prevent this error caused by recent versions of bundler:
#   "Error installing bundler: bundler requires RubyGems version >= 3.0.0."
# RUN gem update --system 3.0.0

# Prevent bundler warnings; ensure that the bundler version executed is >= that which created Gemfile.lock
RUN gem install bundler

# Finish establishing our Ruby environment
RUN bundle install

# Copy the Rails application into place
COPY . .
