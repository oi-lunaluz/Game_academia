import test from 'node:test'
import assert from 'node:assert/strict'
import {questName,questPhase,questChapter,questWindow,questMission} from './pixelQuest.js'
test('fase 6 não recomeça no número 1 após cinco fichas',()=>{
 const names=['Inferiores','Superiores','Glúteos','Posterior','Full body']
 assert.equal(questName(names,5),'Full body')
 assert.equal(questName(names,6),'Inferiores')
 assert.equal(questName(names,8),'Glúteos')
 assert.equal(questPhase(5),6)
})
test('sequência cadastrada sempre permanece na ordem independente da quantidade',()=>{
 const names=['A','B','C']
 assert.deepEqual([1,2,3,4,5,6,7,8].map(n=>questName(names,n)),['A','B','C','A','B','C','A','B'])
})
test('capítulos têm fases contínuas e o protótipo não altera dados originais',()=>{
 const names=['A','B']
 const before=[...names]
 assert.equal(questChapter(5),0)
 assert.equal(questChapter(6),1)
 const chapter=questWindow(1,names,5)
 assert.deepEqual(chapter.map(s=>s.number),[6,7,8,9,10])
 assert.equal(chapter[0].current,true)
 assert.deepEqual(names,before)
})

test('toque na fase exibe a ficha original e exercícios da sequência',()=>{
 const rotation=['Quadríceps','Superiores']
 const workouts=[
  {name:'Quadríceps',exercises:['Agachamento','Cadeira extensora']},
  {name:'Superiores',exercises:['Remada']}
 ]
 const first=questMission(rotation,workouts,1,1)
 assert.deepEqual([first.name,first.exerciseCount],['Quadríceps',2])
 assert.deepEqual(first.exercises,['Agachamento','Cadeira extensora'])
 const sixth=questMission(rotation,workouts,6,5)
 assert.equal(sixth.number,6)
 assert.equal(sixth.name,'Superiores')
 assert.equal(sixth.locked,true)
})
test('fase sem ficha apresenta saída segura para cadastro',()=>{
 const mission=questMission([],[],1,1)
 assert.equal(mission.exists,false)
 assert.equal(mission.exerciseCount,0)
})
