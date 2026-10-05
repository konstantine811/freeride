import assert from 'node:assert/strict'
import {test} from 'node:test'
import {isEarthProjectUrl,myMapsEmbedUrl} from '../src/lib/routeMaps'

test('only real Google Earth project URLs are accepted',()=>{
  assert.equal(isEarthProjectUrl('https://earth.google.com/earth/d/15EABgg-l3xHSvMspAHvlEnrVTPMbXgdO?usp=sharing'),true)
  for(const value of ['http://earth.google.com/earth/d/id','https://earth.google.com.example.org/earth/d/id','https://user@earth.google.com/earth/d/id','https://earth.google.com/','javascript:alert(1)'])assert.equal(isEarthProjectUrl(value),false)
})
test('My Maps sharing links normalize to an allowlisted embed address',()=>{
  assert.equal(myMapsEmbedUrl('https://www.google.com/maps/d/u/0/edit?mid=abc-123_DEF&usp=sharing'),'https://www.google.com/maps/d/embed?mid=abc-123_DEF')
  assert.equal(myMapsEmbedUrl('https://maps.google.com/maps/d/viewer?mid=abc123'),'https://www.google.com/maps/d/embed?mid=abc123')
  for(const value of ['https://earth.google.com/earth/d/abc123','https://www.google.com/maps/d/embed?mid=bad/id','https://example.org/maps/d/embed?mid=abc123','https://www.google.com/maps/d/embed','<iframe src="https://example.org"></iframe>'])assert.equal(myMapsEmbedUrl(value),null)
})

import {youtubeVideoId,youtubeEmbedUrl,isYouTubeChannelUrl} from '../src/lib/youtube'
test('YouTube video sharing links produce a fixed privacy-enhanced player URL',()=>{
  for(const url of ['https://www.youtube.com/watch?v=M7lc1UVf-VE&feature=share','https://youtu.be/M7lc1UVf-VE','https://m.youtube.com/shorts/M7lc1UVf-VE','https://www.youtube.com/live/M7lc1UVf-VE','https://www.youtube-nocookie.com/embed/M7lc1UVf-VE']){
    assert.equal(youtubeVideoId(url),'M7lc1UVf-VE')
    assert.equal(youtubeEmbedUrl(url),'https://www.youtube-nocookie.com/embed/M7lc1UVf-VE?autoplay=1&playsinline=1&rel=0&hl=uk')
  }
})
test('search, channel and unsafe links cannot become player iframes',()=>{
  for(const url of ['https://www.youtube.com/results?search_query=freeride','https://www.youtube.com/@freeride','http://youtu.be/M7lc1UVf-VE','https://www.youtube.com.evil.example/watch?v=M7lc1UVf-VE','https://user@youtu.be/M7lc1UVf-VE','javascript:alert(1)','https://youtu.be/invalid','https://youtu.be/M7lc1UVf-VE/extra'])assert.equal(youtubeEmbedUrl(url),null)
  assert.equal(isYouTubeChannelUrl('https://www.youtube.com/@freeride/videos'),true)
  assert.equal(isYouTubeChannelUrl('https://www.youtube.com/watch?v=M7lc1UVf-VE'),false)
  assert.equal(isYouTubeChannelUrl('https://example.org/@freeride'),false)
})
