import Twit from 'twit';

let T;

function initialize() {
  T = new Twit({
    consumer_key:         process.env.CONSUMER_KEY,
    consumer_secret:      process.env.CONSUMER_SECRET,
    access_token:         process.env.ACCESS_TOKEN,
    access_token_secret:  process.env.ACCESS_TOKEN_SECRET,
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  });
}

function hasASongUrl(urls) {
  if (!Array.isArray(urls) || urls.length === 0) {
    return false;
  }

  const songUrlIndex = urls.findIndex(el => el.expanded_url.includes('musicboxfun.com/#'));

  if (songUrlIndex === -1) {
    return false;
  }

  return true;
}

function retweetValidTweets(tweet) {
  const id = tweet.id_str;

  // Don't retweet it, if we've already retweeted it.
  if (tweet.retweeted_status) {
    return;
  }

  // Don't retweet it, if it is missing a song url.
  if (!hasASongUrl(tweet.entities.urls)) {
    return;
  }

  T.post('statuses/retweet/:id', { id }, function (err, data, response) {
    if (err) {
      console.log(err);
    }
  });
};

function runBot() {
  initialize();
  const stream = T.stream('statuses/filter', { track: ['musicboxfun com'] })
  console.log('the bot is running');

  stream.on('tweet', retweetValidTweets);
}

export {
  runBot
}
