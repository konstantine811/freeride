import assert from 'node:assert/strict'
import { test } from 'node:test'
import { defaultContent, imageUrlSchema, siteContentSchema, routeSchema } from '../src/data/content'
import { createDemoRoute } from '../src/data/demoRoutes'

test('existing website content is valid',()=>{
  assert.equal(siteContentSchema.safeParse(defaultContent).success,true)
})
test('rejects executable, data and insecure image URLs',()=>{
  for(const value of ['javascript:alert(1)','data:image/svg+xml,test','http://example.com/image.jpg','https://user:pass@example.com/photo.png'])assert.equal(imageUrlSchema.safeParse(value).success,false)
  assert.equal(imageUrlSchema.safeParse('/images/hero.png').success,true)
  assert.equal(imageUrlSchema.safeParse('https://firebasestorage.googleapis.com/v0/b/project/o/content%2Fphoto.png?alt=media&token=example').success,true)
})
test('rejects duplicate report addresses and empty galleries',()=>{
  const draft=structuredClone(defaultContent)
  draft.reports[1].slug=draft.reports[0].slug
  assert.equal(siteContentSchema.safeParse(draft).success,false)
  draft.reports[1].slug='different-slug'
  draft.reports[0].photos=[]
  assert.equal(siteContentSchema.safeParse(draft).success,false)
})
test('rejects unsafe video links and excessive content',()=>{
  for(const videoUrl of ['', 'not a URL'])assert.equal(siteContentSchema.safeParse({...defaultContent,videoUrl}).success,false)
  assert.equal(siteContentSchema.safeParse({...defaultContent,texts:{...defaultContent.texts,'video.channelUrl':'https://example.org/channel'}}).success,false)
  assert.equal(siteContentSchema.safeParse({...defaultContent,videoUrl:'javascript:alert(1)'}).success,false)
  assert.equal(siteContentSchema.safeParse({...defaultContent,videoUrl:'http://youtube.com/watch?v=example'}).success,false)
  assert.equal(siteContentSchema.safeParse({...defaultContent,texts:{title:'x'.repeat(10001)}}).success,false)
})

test('route settings are optional for existing published reports',()=>{
  const draft=structuredClone(defaultContent)
  for(const report of draft.reports)delete report.route
  assert.equal(siteContentSchema.safeParse(draft).success,true)
  draft.reports[0].route={earthUrl:'https://earth.google.com/earth/d/15EABgg-l3xHSvMspAHvlEnrVTPMbXgdO?usp=sharing',mapUrl:'',previewImage:'',description:'Пройдений маршрут'}
  assert.equal(siteContentSchema.safeParse(draft).success,true)
  draft.reports[0].route.earthUrl='https://earth.google.com.attacker.example/earth/d/id'
  assert.equal(siteContentSchema.safeParse(draft).success,false)
  draft.reports[0].route.earthUrl='javascript:alert(1)'
  assert.equal(siteContentSchema.safeParse(draft).success,false)
})

test('demo routes validate and have independent coordinate arrays',()=>{
  for(let index=0;index<3;index++)assert.equal(routeSchema.safeParse(createDemoRoute(index)).success,true)
  const route=createDemoRoute(0)
  route.track![0].lat=0
  assert.notEqual(createDemoRoute(0).track![0].lat,0)
})

test('tracks reject invalid coordinates, single points and excessive length',()=>{
  for(const track of [[[91,24],[48,24]],[[48,181],[48,24]],[[NaN,24],[48,24]],[[48,24]],Array.from({length:5001},()=>[48,24])]){
    assert.equal(routeSchema.safeParse({...createDemoRoute(0),track:track.map(([lat,lng])=>({lat,lng}))}).success,false)
  }
  assert.equal(routeSchema.safeParse({...createDemoRoute(0),track:[]}).success,true)
})
