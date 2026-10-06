import {readFileSync} from 'node:fs'
import {after,before,test} from 'node:test'
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing'
import {doc,getDoc,getDocs,collection,setDoc,deleteDoc,serverTimestamp,writeBatch} from 'firebase/firestore'
import {ref,uploadBytes,getBytes} from 'firebase/storage'

let environment
const content={texts:{'hero.title':'Test'},images:{'hero.image':'/images/hero.png'},reports:[{slug:'test-report'}],videoUrl:'https://www.youtube.com/',heroLayers:true}
const payload=(uid,revision)=>({content,revision,updatedBy:uid,updatedAt:serverTimestamp()})
before(async()=>{
  environment=await initializeTestEnvironment({projectId:'demo-freeride',firestore:{rules:readFileSync('firebase/firestore.rules','utf8')},storage:{rules:readFileSync('firebase/storage.rules','utf8')}})
  await environment.clearFirestore()
  await environment.withSecurityRulesDisabled(async context=>{
    const database=context.firestore()
    await setDoc(doc(database,'owners','owner'),{})
    await setDoc(doc(database,'admins','editor'),{email:'editor@example.com',enabled:true})
  })
})
after(async()=>{await environment?.cleanup()})

test('guests and ordinary authenticated users cannot publish or promote themselves',async()=>{
  const guest=environment.unauthenticatedContext().firestore()
  const user=environment.authenticatedContext('ordinary').firestore()
  await assertSucceeds(getDoc(doc(guest,'site','main')))
  await assertSucceeds(getDoc(doc(user,'admins','ordinary')))
  await assertFails(setDoc(doc(guest,'site','main'),payload('ordinary',1)))
  await assertFails(setDoc(doc(user,'site','main'),payload('ordinary',1)))
  await assertFails(setDoc(doc(user,'admins','ordinary'),{email:'ordinary@example.com',enabled:true}))
  await assertFails(setDoc(doc(user,'owners','ordinary'),{}))
  await assertFails(getDocs(collection(user,'admins')))
  await assertFails(getDoc(doc(user,'admins','editor')))
})
test('admins publish with revision checks; permissions do not allow role management',async()=>{
  const editor=environment.authenticatedContext('editor').firestore()
  await assertSucceeds(setDoc(doc(editor,'site','main'),payload('editor',1)))
  await assertSucceeds(setDoc(doc(editor,'site','main'),payload('editor',2)))
  await assertFails(setDoc(doc(editor,'site','main'),payload('editor',2)))
  await assertFails(setDoc(doc(editor,'site','main'),payload('owner',3)))
  await assertFails(deleteDoc(doc(editor,'site','main')))
  await assertFails(setDoc(doc(editor,'admins','another'),{email:'another@example.com',enabled:true}))
})
test('only the owner grants and revokes editor roles; clients cannot create owners',async()=>{
  const owner=environment.authenticatedContext('owner').firestore()
  const revoked=environment.authenticatedContext('revoked').firestore()
  await assertSucceeds(getDocs(collection(owner,'admins')))
  await assertFails(setDoc(doc(owner,'owners','another-owner'),{}))
  await assertSucceeds(setDoc(doc(owner,'admins','revoked'),{email:'revoked@example.com',enabled:true}))
  await assertSucceeds(setDoc(doc(revoked,'site','main'),payload('revoked',3)))
  await assertSucceeds(deleteDoc(doc(owner,'admins','revoked')))
  await assertFails(setDoc(doc(revoked,'site','main'),payload('revoked',4)))
})
test('storage accepts editor images only; rejects foreign paths, oversized or executable files',async()=>{
  const editor=environment.authenticatedContext('editor').storage()
  const ordinary=environment.authenticatedContext('ordinary').storage()
  const guest=environment.unauthenticatedContext().storage()
  const data=new Uint8Array([137,80,78,71])
  await assertFails(uploadBytes(ref(ordinary,'content/ordinary/test.png'),data,{contentType:'image/png'}))
  await assertFails(uploadBytes(ref(guest,'content/guest/test.png'),data,{contentType:'image/png'}))
  await assertFails(uploadBytes(ref(editor,'content/someone-else/test.png'),data,{contentType:'image/png'}))
  await assertFails(uploadBytes(ref(editor,'content/editor/test.svg'),data,{contentType:'image/svg+xml'}))
  await assertFails(uploadBytes(ref(editor,'content/editor/large.png'),new Uint8Array(10*1024*1024+1),{contentType:'image/png'}))
  await assertSucceeds(uploadBytes(ref(editor,'content/editor/valid.png'),data,{contentType:'image/png'}))
  await assertSucceeds(getBytes(ref(guest,'content/editor/valid.png')))
  await assertFails(uploadBytes(ref(editor,'content/editor/valid.png'),data,{contentType:'image/png'}))
})


test('separate reports require atomic publication and preserve role and revision checks',async()=>{
  const editor=environment.authenticatedContext('editor').firestore()
  const guest=environment.unauthenticatedContext().firestore()
  const ordinary=environment.authenticatedContext('ordinary').firestore()
  const main=doc(editor,'site','main')
  const revision=(await getDoc(main)).data().revision+1
  const {reports,...settings}=content
  const report={slug:'separate-report',title:'Test',image:'/images/hero.png',paragraphs:['Story'],photos:[{src:'/images/hero.png',alt:'Test'}]}
  const record={report,order:0,revision,updatedBy:'editor',updatedAt:serverTimestamp()}
  await assertFails(setDoc(doc(editor,'reports',report.slug),record))
  const batch=writeBatch(editor)
  batch.set(main,{content:settings,storageVersion:2,revision,updatedBy:'editor',updatedAt:serverTimestamp()})
  batch.set(doc(editor,'reports',report.slug),record)
  await assertSucceeds(batch.commit())
  await assertSucceeds(getDocs(collection(guest,'reports')))
  await assertFails(setDoc(doc(ordinary,'reports',report.slug),record))
  await assertFails(deleteDoc(doc(editor,'reports',report.slug)))
  const remove=writeBatch(editor)
  remove.set(main,{content:settings,storageVersion:2,revision:revision+1,updatedBy:'editor',updatedAt:serverTimestamp()})
  remove.delete(doc(editor,'reports',report.slug))
  await assertSucceeds(remove.commit())
})
