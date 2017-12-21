'use strict';

const CLIENT_ID = 'eb6dfffda5534bb5996e872487be4321';

const getFromApi = function (endpoint, query = {}) {
  // You won't need to change anything in this function, but you will use this function 
  // to make calls to Spotify's different API endpoints. Pay close attention to this 
  // function's two parameters.

  const url = new URL(`https://api.spotify.com/v1/${endpoint}`);
  const headers = new Headers();
  headers.set('Authorization', `Bearer ${localStorage.getItem('SPOTIFY_ACCESS_TOKEN')}`);
  headers.set('Content-Type', 'application/json');
  const requestObject = {
    headers
  };

  Object.keys(query).forEach(key => url.searchParams.append(key, query[key]));
  return fetch(url, requestObject).then(function (response) {
    if (!response.ok) {
      return Promise.reject(response.statusText);
    }
    return response.json();
  });
};

let artist;


const getArtist = function (name) {
  const queryObj = {
    q: name,
    limit: 1,
    type: 'artist',
  };

  return getFromApi('search', queryObj)
    .then(item => {
      artist = item.artists.items[0];
      console.log('artist.id =', artist.id);
      // console.log(getFromApi(`artists/${artist.id}/related-artists`));
      return getFromApi(`artists/${artist.id}/related-artists`);
    })
    .then(item =>{
      console.log('item is: ', item);
      console.log('related artists are: ', item.artists);
      artist.related = item.artists;
      const relatedArtistTracks = item.artists.map(function(artist) {
        return getFromApi(`artists/${artist.id}/top-tracks/?country=US`);
      });
      console.log('You promise calls are:', relatedArtistTracks);
      return Promise.all(relatedArtistTracks);
      // return artist;
    })
    .then(responses => {
      console.log('responses are', responses);
      for (let i=0; i < responses.length; i++){
        artist.related[i].tracks = responses[i].tracks;
      }
      return artist;
    })
    .catch(function(err){
      console.log('This went wrong:', err);
    });
  // artists / { id } / related - artists
  // Edit me!
  // (Plan to call `getFromApi()` several times over the whole exercise from here!)
};





// Update your getArtists method to also fetch a list of artists related to the one you are searching for.

// Instead of returning the artist object from your getFromApi callback, return a request to the get related artists endpoint.
// It should use the artist ID from the artist object.
// Chain another then call to handle the response from your second request.
// Inside the callback you should:
// Set artist.related to item.artists, where item is the object returned by the get related artists endpoint.
// Return the artist object.
// Try searching for an artist again.You should now see a list of related artists also being displayed.






// =========================================================================================================
// IGNORE BELOW THIS LINE - THIS IS RELATED TO SPOTIFY AUTHENTICATION AND IS NOT NECESSARY  
// TO REVIEW FOR THIS EXERCISE
// =========================================================================================================
const login = function () {
  const AUTH_REQUEST_URL = 'https://accounts.spotify.com/authorize';
  const REDIRECT_URI = 'http://localhost:8080/auth.html';

  const query = new URLSearchParams();
  query.set('client_id', CLIENT_ID);
  query.set('response_type', 'token');
  query.set('redirect_uri', REDIRECT_URI);

  window.location = AUTH_REQUEST_URL + '?' + query.toString();
};

$(() => {
  $('#login').click(login);
});
