import { dateKey, fromDateKey } from './planner.js'

const addDays=(key,days)=>{
  const d=fromDateKey(key)
  if(!d)return null
  d.setDate(d.getDate()+days)
  return dateKey(d)
}
const diffDays=(from,to)=>{
  const a=fromDateKey(from),b=fromDateKey(to)
  if(!a||!b)return NaN
  return Math.round((Date.UTC(b.getFullYear(),b.getMonth(),b.getDate())-
    Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()))/86400000)
}
export const cycleLength=n=>Number.isInteger(Number(n))&&Number(n)>=15&&Number(n)<=60?Number(n):28
export const periodLength=n=>Number.isInteger(Number(n))&&Number(n)>=1&&Number(n)<=15?Number(n):5

export function cycleStarts(cycle={},today=dateKey(new Date())){
  const input=Array.isArray(cycle.periodStarts)?cycle.periodStarts:[]
  const legacy=cycle.start?[cycle.start]:[]
  return [...new Set([...input,...legacy].filter(d=>fromDateKey(d)&&d<=today))].sort()
}

// One tap registers onset and estimates the following days from the configured
// period duration. Tapping its marked days removes the onset (undo).
export function togglePeriodStart(cycle={},day,today=dateKey(new Date())){
  if(!fromDateKey(day)||day>today)return null
  const starts=cycleStarts(cycle,today)
  const duration=periodLength(cycle.period)
  const hit=starts.find(start=>day>=start&&day<addDays(start,duration))
  const next=hit?starts.filter(s=>s!==hit):[...starts,day].sort()
  return {periodStarts:next,start:next.at(-1)||'',enabled:true}
}

export function cycleDayInfo(cycle={},today=dateKey(new Date())){
  const starts=cycleStarts(cycle,today)
  const last=starts.at(-1)||null
  const length=cycleLength(cycle.length)
  const day=last?diffDays(last,today)+1:null
  const cyclesPassed=day?Math.floor((day-1)/length):0
  const estimatedDay=day?((day-1)%length)+1:null
  const next=last?addDays(last,(cyclesPassed+1)*length):null
  const nextIn=next?diffDays(today,next):null
  return {last,day,estimatedDay,next,nextIn,starts}
}


export const CYCLE_PHASES=Object.freeze({
  menstrual:{id:'menstrual',title:'Menstruação',color:'rosa',
    description:'Nesta fase algumas pessoas sentem cólicas, cansaço ou menos disposição. Você pode adaptar a intensidade do treino conforme seu conforto; outras pessoas treinam normalmente.'},
  follicular:{id:'follicular',title:'Fase folicular',color:'verde',
    description:'Depois da menstruação, algumas pessoas relatam mais disposição. Isso não garante aumento de força. Observe como você se sente e como responde aos exercícios.'},
  ovulatory:{id:'ovulatory',title:'Período ovulatório',color:'amarelo',
    description:'A ovulação é apenas estimada pelo calendário. Não existe garantia de pico de força nessa fase, nem certeza sobre o dia de ovulação.'},
  luteal:{id:'luteal',title:'Fase lútea',color:'lilás',
    description:'Na fase pré-menstrual podem aparecer alterações no sono, calor, sensibilidade, cansaço e sintomas de TPM. Se afetarem seu treino, vale ajustar esforço e recuperação.'}
})

// Phase colors are approximate educational ranges, not ovulation detection.
// A recorded period always takes priority over estimated phases.
export function phaseForCycleDate(cycle={},day,today=dateKey(new Date())){
  if(!fromDateKey(day))return null
  const starts=cycleStarts(cycle,today)
  const onset=starts.filter(start=>start<=day).at(-1)
  if(!onset)return null
  const length=cycleLength(cycle.length)
  const period=periodLength(cycle.period)
  const cycleDay=((diffDays(onset,day)%length)+length)%length+1
  const recorded=starts.some(start=>day>=start&&day<addDays(start,period))
  if(recorded||cycleDay<=period)return 'menstrual'
  const approximateOvulation=Math.max(period+2,Math.min(length-1,length-14))
  if(cycleDay>=approximateOvulation&&cycleDay<=Math.min(length,approximateOvulation+1))return 'ovulatory'
  if(cycleDay<approximateOvulation)return 'follicular'
  return 'luteal'
}

export function cycleCalendar(cycle,month,year,today=dateKey(new Date())){
  const first=new Date(year,month,1)
  const offset=first.getDay()
  const starts=cycleStarts(cycle,today)
  const length=cycleLength(cycle.length)
  const duration=periodLength(cycle.period)
  const last=starts.at(-1)
  const forecast=[]
  if(last){
    for(let n=1;n<=18;n++){
      const next=addDays(last,n*length)
      if(next&&diffDays(last,next)<=540)forecast.push(next)
    }
  }
  return Array.from({length:42},(_,i)=>{
    const d=new Date(year,month,1-offset+i)
    const date=dateKey(d)
    const recordedStart=starts.find(s=>s===date)
    const recorded=starts.find(s=>date>=s&&date<addDays(s,duration))
    const predicted=!recorded&&forecast.find(s=>date>=s&&date<addDays(s,duration))
    return {
      date,number:d.getDate(),outside:d.getMonth()!==month,
      today:date===today,future:date>today,recorded:!!recorded,
      recordedStart:!!recordedStart,predicted:!!predicted,
      phase:phaseForCycleDate(cycle,date,today),
      firstDay:!!(recordedStart||(!recorded&&predicted===date))
    }
  })
}
