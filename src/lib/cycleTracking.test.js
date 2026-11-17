import test from 'node:test'
import assert from 'node:assert/strict'
import {cycleStarts,togglePeriodStart,cycleDayInfo,cycleCalendar,phaseForCycleDate,CYCLE_PHASES} from './cycleTracking.js'

const today='2026-11-17'
test('um toque registra a data inicial e pinta a duração configurada',()=>{
  const updated=togglePeriodStart({length:28,period:5},'2026-11-12',today)
  assert.deepEqual(updated.periodStarts,['2026-11-12'])
  assert.equal(updated.start,'2026-11-12')
  const days=cycleCalendar({...updated,length:28,period:5},10,2026,today)
  assert.equal(days.find(x=>x.date==='2026-11-12').recordedStart,true)
  assert.equal(days.find(x=>x.date==='2026-11-16').recorded,true)
  assert.equal(days.find(x=>x.date==='2026-11-17').recorded,false)
})
test('tocar novamente em dia registrado desfaz o registro inteiro',()=>{
  const updated=togglePeriodStart({start:'2026-11-12',periodStarts:['2026-11-12'],period:5},'2026-11-14',today)
  assert.deepEqual(updated.periodStarts,[])
  assert.equal(updated.start,'')
})
test('registro passado é preservado ao iniciar outra menstruação',()=>{
  const base={start:'2026-10-15',periodStarts:['2026-10-15'],length:28,period:4}
  const updated=togglePeriodStart(base,'2026-11-12',today)
  assert.deepEqual(updated.periodStarts,['2026-10-15','2026-11-12'])
  assert.equal(cycleDayInfo(updated,today).day,6)
})
test('dia futuro não pode ser registrado',()=>{
  assert.equal(togglePeriodStart({},'2026-11-18',today),null)
})
test('registros se distinguem de datas apenas estimadas',()=>{
  const cycle={start:'2026-10-15',periodStarts:['2026-10-15'],length:28,period:5}
  const days=cycleCalendar(cycle,10,2026,today)
  assert.equal(days.find(x=>x.date==='2026-11-12').predicted,true)
  assert.equal(days.find(x=>x.date==='2026-11-12').recorded,false)
})
test('migração mantém registro legado e ignora datas malformadas',()=>{
  assert.deepEqual(cycleStarts({start:'2026-11-12',periodStarts:['invalido','2026-11-12']},today),['2026-11-12'])
})
test('valores inválidos de duração têm padrões seguros, sem dias de fertilidade',()=>{
  const d=cycleCalendar({start:'2026-11-12',period:0,length:0},10,2026,today)
  assert.equal(d.filter(x=>x.recorded).length,5)
  assert.ok(d.every(x=>!['fertile','ovulation'].includes(x.phase)))
})

test('calendário mostra as quatro fases depois do primeiro registro',()=>{
 const cycle={start:'2026-11-01',periodStarts:['2026-11-01'],length:28,period:5}
 assert.equal(phaseForCycleDate(cycle,'2026-11-02',today),'menstrual')
 assert.equal(phaseForCycleDate(cycle,'2026-11-08',today),'follicular')
 assert.equal(phaseForCycleDate(cycle,'2026-11-14',today),'ovulatory')
 assert.equal(phaseForCycleDate(cycle,'2026-11-20',today),'luteal')
 const all=cycleCalendar(cycle,10,2026,today)
 assert.equal(all.find(day=>day.date==='2026-11-02').phase,'menstrual')
 assert.equal(all.find(day=>day.date==='2026-11-08').phase,'follicular')
 assert.equal(all.find(day=>day.date==='2026-11-14').phase,'ovulatory')
 assert.equal(all.find(day=>day.date==='2026-11-20').phase,'luteal')
})
test('nenhuma fase é calculada antes de registrar início de menstruação',()=>{
 assert.equal(phaseForCycleDate({},'2026-11-17',today),null)
 assert.ok(Object.values(CYCLE_PHASES).every(item=>item.title&&item.description))
})
test('um novo registro real reinicia a contagem das fases naquele dia',()=>{
 const cycle={start:'2026-11-15',periodStarts:['2026-10-15','2026-11-15'],length:28,period:5}
 assert.equal(phaseForCycleDate(cycle,'2026-11-16',today),'menstrual')
 assert.equal(phaseForCycleDate(cycle,'2026-11-10',today),'menstrual')
})
test('a data menstruação registrada prevalece sobre fase estimada',()=>{
 const cycle={start:'2026-11-01',periodStarts:['2026-11-01'],length:28,period:5}
 const all=cycleCalendar(cycle,10,2026,today)
 const recorded=all.find(day=>day.date==='2026-11-02')
 assert.equal(recorded.recorded,true)
 assert.equal(recorded.phase,'menstrual')
 assert.equal(recorded.predicted,false)
})
