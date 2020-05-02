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
    console.log('urls is not an Array');
    return false;
  }

  const songUrlIndex = urls.findIndex(el => el.expanded_url.includes('musicboxfun.com/#'));

  if (songUrlIndex === -1) {
    return false;
  }

  return true;
}

function runBot() {
  initialize();
  const stream = T.stream('statuses/filter', { track: ['musicboxfun com'] });

  console.log('the bot is running');

  stream.on('tweet', async tweet => {
    const id = tweet.id_str;

    // Don't retweet it, if we've already retweeted it.
    if (tweet.retweeted_status) {
      return;
    }

    console.log('Tweet with musicboxfun.com URL detected:', id);

    // Look up this tweet ID, so we can confirm that a song is being shared.
    // This requires a call to the JSON API b/c the streaming API doesn't currently
    // support "tweet_mode: extended". We need this mode to consistently look up the
    // full expanded_url being shared. For more details, see:
    // https://dev.to/frontendwizard/comment/9785
    // https://developer.twitter.com/en/docs/tweets/tweet-updates
    try {
      const result = await T.get('statuses/show/:id', { id, tweet_mode: 'extended' });

      console.log('Tweet URL data:', result.data.entities.urls);

      if (!hasASongUrl(result.data.entities.urls)) return;

      console.log('Tweet has a valid a song URL.');

      await T.post('statuses/retweet/:id', { id });
    } catch (err) {
      console.log(err);
    }
  });
}

export {
  runBot
}
