import test from 'node:test'
import assert from 'node:assert/strict'
import {calculateStreak,loadAchievements,newlyUnlocked} from './gamification.js'
const entry=(date,kind='forca',sets={})=>({date,kind,name:'Treino 1',sets})
const calc=(history,now='2026-11-17')=>calculateStreak({history,now:new Date(now+'T12:00:00')})

test('a ofensiva cresce por dias de treino, sem duplicar sessões no mesmo dia',()=>{
 const r=calc([entry('14/11/2026'),entry('14/11/2026','cardio'),entry('15/11/2026'),entry('16/11/2026')])
 assert.equal(r.current,3)
 assert.equal(r.best,3)
 assert.equal(r.total,3)
 assert.equal(r.day,3)
 assert.equal(r.unlocked.find(x=>x.id==='streak_3')?.tier,'Rosa')
})

test('um dia sem treinar é tolerado e não conta como treino, nem apaga fases',()=>{
 const r=calc([entry('14/11/2026'),entry('16/11/2026')])
 assert.equal(r.current,2)
 assert.equal(r.missedDays,0)
 assert.equal(r.expired,false)
})

test('dois dias completos sem registros levam ofensiva ao dia 1, sem apagar melhores marcos',()=>{
 const history=[entry('11/11/2026'),entry('12/11/2026'),entry('13/11/2026')]
 const r=calc(history,'2026-11-16')
 assert.equal(r.current,0)
 assert.equal(r.day,1)
 assert.equal(r.best,3)
 assert.equal(r.expired,true)
 assert.equal(r.unlocked.some(x=>x.id==='streak_3'),true)
 assert.equal(history.length,3)
})

test('registro após dois dias vazios recomeça do dia 1',()=>{
 const r=calc([entry('10/11/2026'),entry('11/11/2026'),entry('14/11/2026'),entry('17/11/2026')])
 assert.equal(r.current,1)
 assert.equal(r.best,2)
 assert.equal(r.day,1)
})

test('se só ontem faltou, hoje ainda há chance de manter a ofensiva',()=>{
 const r=calc([entry('14/11/2026'),entry('15/11/2026')],'2026-11-17')
 assert.equal(r.current,2)
 assert.equal(r.missedDays,1)
 assert.equal(r.expired,false)
})

test('cardio e checks rápidos registrados contam na ofensiva, mas não geram cargas inventadas',()=>{
 const r=calc([entry('15/11/2026','cardio'),{...entry('17/11/2026'),quick:true,sets:{}}])
 assert.equal(r.current,2)
 assert.equal(r.loadRewards.length,0)
})

test('conquistas de tempo consideram dias distintos de toda a jornada',()=>{
 const history=Array.from({length:8},(_,i)=>entry(String(i+1).padStart(2,'0')+'/11/2026'))
 const r=calc(history)
 assert.equal(r.timeRewards.some(x=>x.id==='time_7'),true)
 assert.equal(r.total,8)
 assert.equal(r.current,0)
})

test('carga dobra em relação ao primeiro registro positivo de cada exercício',()=>{
 const history=[entry('10/11/2026','forca',{'Agachamento':[{kg:20,reps:8}]}),
  entry('17/11/2026','forca',{'Agachamento':[{kg:40,reps:8}]})]
 const a=loadAchievements(history,new Date('2026-11-17T12:00:00'))
 assert.ok(a.rewards.some(x=>x.id==='double_Agachamento'))
 assert.ok(a.rewards.some(x=>x.tier==='Bronze'))
 assert.ok(!a.rewards.some(x=>x.tier==='Ouro'))
})

test('50 kg dá prata e 100 kg dá ouro, por exercício, sem afetar outro exercício',()=>{
 const history=[entry('17/11/2026','forca',{'Supino':[{kg:100,reps:5}], 'Rosca':[{kg:9,reps:10}]})]
 const a=loadAchievements(history,new Date('2026-11-17T12:00:00'))
 assert.equal(a.rewards.some(x=>x.id==='load_50_Supino'&&x.tier==='Prata'),true)
 assert.equal(a.rewards.some(x=>x.id==='load_100_Supino'&&x.tier==='Ouro'),true)
 assert.equal(a.rewards.some(x=>x.id==='load_50_Rosca'),false)
})

test('não concede marcos por séries inválidas nem registros futuros',()=>{
 const history=[entry('20/11/2026','forca',{'Agachamento':[{kg:100,reps:10}]}),
  entry('17/11/2026','forca',{'Rosca':[{kg:0,reps:10},{kg:200,reps:0}]})]
 assert.equal(calc(history).loadRewards.length,0)
})

test('premiações novas são encontradas sem repetir as anteriores',()=>{
 const before=calc([entry('10/11/2026')])
 const after=calc([entry('10/11/2026'),entry('11/11/2026'),entry('12/11/2026')])
 assert.deepEqual(newlyUnlocked(before,after).map(x=>x.id),['streak_3'])
})


test('medalhas por tempo usam horas reais e não minutos fictícios de check rápido',()=>{
 const history=[
  {...entry('17/11/2026','cardio'),seconds:3600},
  {...entry('17/11/2026','forca'),seconds:7200},
  {...entry('17/11/2026','forca'),seconds:0,quick:true}
 ]
 const r=calc(history)
 assert.equal(r.hours,3)
 assert.ok(r.hoursRewards.some(x=>x.id==='hours_1'&&x.tier==='Rosa'))
 assert.equal(r.hoursRewards.some(x=>x.id==='hours_5'),false)
 assert.equal(r.total,1)
})
test('cinco horas acumuladas destravam bronze sem precisar de dias consecutivos',()=>{
 const history=[
  {...entry('01/11/2026'),seconds:10800},
  {...entry('17/11/2026','cardio'),seconds:7200}
 ]
 const r=calc(history)
 assert.ok(r.hoursRewards.some(x=>x.id==='hours_5'&&x.tier==='Bronze'))
 assert.equal(r.current,1)
})
