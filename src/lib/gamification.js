import { dateKey, fromBrazilDate, fromDateKey } from './planner.js'

// Distinct awards: streak milestones, lifetime consistency, and each exercise's load.
export const REWARDS = Object.freeze([
  {id:'streak_3',threshold:3,title:'Primeira Chama',tier:'Rosa',category:'streak',description:'Três dias de treino na mesma sequência!'},
  {id:'streak_7',threshold:7,title:'Semana de Fogo',tier:'Bronze',category:'streak',description:'Sete dias de treino em sequência, com até um dia de pausa.'},
  {id:'streak_15',threshold:15,title:'Constância de Prata',tier:'Prata',category:'streak',description:'Quinze dias de treino na mesma ofensiva.'},
  {id:'streak_30',threshold:30,title:'Rainha da Rotina',tier:'Ouro',category:'streak',description:'Trinta dias de treino na mesma ofensiva.'},
  {id:'streak_60',threshold:60,title:'Lenda da Constância',tier:'Ouro',category:'streak',description:'Sessenta dias de treino na mesma ofensiva.'},
  {id:'streak_100',threshold:100,title:'CaraMary Supreme',tier:'Ouro',category:'streak',description:'Cem dias de treino na mesma ofensiva!'}
])
export const TIME_REWARDS = Object.freeze([
  {id:'time_7',threshold:7,title:'Primeiros Passos',tier:'Rosa',category:'time',description:'Sete dias diferentes com treino registrado ao longo da jornada.'},
  {id:'time_30',threshold:30,title:'Um Mês de Conquistas',tier:'Bronze',category:'time',description:'Trinta dias de treino registrados ao longo da jornada.'},
  {id:'time_90',threshold:90,title:'Veterana da Aventura',tier:'Prata',category:'time',description:'Noventa dias de treino registrados ao longo da jornada.'},
  {id:'time_180',threshold:180,title:'Lenda do Movimento',tier:'Ouro',category:'time',description:'Cento e oitenta dias de treino registrados ao longo da jornada.'}
])
export const LOAD_MILESTONES = Object.freeze([
  {kg:10,tier:'Rosa',label:'Primeira Força'},
  {kg:25,tier:'Bronze',label:'Força de Bronze'},
  {kg:50,tier:'Prata',label:'Insígnia de Prata'},
  {kg:100,tier:'Ouro',label:'Medalha de Ouro'}
])

const dayOrdinal=key=>Math.floor(fromDateKey(key).getTime()/86400000)
// UTC day ordinals avoid DST across local calendar dates.
const ordinal=key=>{
  const d=fromDateKey(key)
  return d===null?NaN:Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000)
}

function eligibleDates(history,now) {
  const today=dateKey(now)
  return [...new Set((Array.isArray(history)?history:[])
    .filter(h=>h?.kind==='forca'||h?.kind==='cardio')
    .map(h=>fromBrazilDate(h.date))
    .filter(Boolean)
    .map(dateKey)
    .filter(d=>d<=today))].sort()
}

export function loadAchievements(history=[],now=new Date()) {
  const nowKey=dateKey(now)
  const entries=(Array.isArray(history)?history:[])
    .map((h,index)=>({h,index,day:fromBrazilDate(h?.date)}))
    .filter(({h,day})=>h?.kind==='forca'&&day&&dateKey(day)<=nowKey)
    .sort((a,b)=>a.day-b.day||a.index-b.index)
  const byExercise=new Map()
  for(const {h,day} of entries) {
    for(const [exercise,sets] of Object.entries(h.sets||{})) {
      if(!exercise.trim()||!Array.isArray(sets))continue
      for(const set of sets) {
        const kg=Number(set?.kg)
        const reps=Number(set?.reps)
        if(!Number.isFinite(kg)||kg<=0||kg>2000||!Number.isFinite(reps)||reps<=0)continue
        const old=byExercise.get(exercise)
        if(!old)byExercise.set(exercise,{exercise,firstKg:kg,maxKg:kg,firstDate:dateKey(day)})
        else old.maxKg=Math.max(old.maxKg,kg)
      }
    }
  }
  const rewards=[]
  for(const item of byExercise.values()) {
    const id=encodeURIComponent(item.exercise)
    if(item.maxKg>=2*item.firstKg)
      rewards.push({
        id:'double_'+id,category:'load',tier:'Rosa',title:'Força em Dobro',
        exercise:item.exercise,threshold:2*item.firstKg,loadKg:item.maxKg,
        description:`Parabéns! Em ${item.exercise}, você dobrou sua primeira carga: de ${item.firstKg} kg para ${item.maxKg} kg!`
      })
    for(const milestone of LOAD_MILESTONES) {
      if(item.maxKg>=milestone.kg)rewards.push({
        id:'load_'+milestone.kg+'_'+id,category:'load',
        tier:milestone.tier,title:milestone.label,exercise:item.exercise,
        threshold:milestone.kg,loadKg:item.maxKg,
        description:`Parabéns! Você alcançou ${milestone.kg} kg no exercício ${item.exercise}!`
      })
    }
  }
  return {rewards,exercises:[...byExercise.values()].sort((a,b)=>a.exercise.localeCompare(b.exercise,'pt-BR'))}
}

/**
 * Duolingo-like training streak. Every day with a recorded strength/cardio
 * session adds ONE day. One complete day without a session is a grace day.
 * TWO complete days without any registered session reset the live streak.
 * The new workout restarts from day 1; historic best/earned awards persist.
 * Existing workouts, training rotation, and quest phases are not modified.
 */
export function calculateStreak({history=[],now=new Date()}={}) {
  const dates=eligibleDates(history,now)
  let run=0,best=0
  for(let i=0;i<dates.length;i++){
    const gap=i?ordinal(dates[i])-ordinal(dates[i-1]):0
    run=gap>2?1:run+1
    best=Math.max(best,run)
  }
  const today=dateKey(now)
  const last=dates.at(-1)||null
  const missed=last?Math.max(0,ordinal(today)-ordinal(last)-1):0
  const daysSince=last?ordinal(today)-ordinal(last):null
  // After two full missed days the streak resets. Today's opportunity is open.
  const expired=daysSince!==null&&daysSince>=3
  const current=expired?0:run
  const allTime=dates.length
  const streakRewards=REWARDS.filter(r=>best>=r.threshold)
  const timeRewards=TIME_REWARDS.filter(r=>allTime>=r.threshold)
  const loads=loadAchievements(history,now)
  const unlocked=[...streakRewards,...timeRewards,...loads.rewards]
  const next=REWARDS.find(r=>best<r.threshold)||null
  return {
    current,best,total:allTime,qualified:allTime,missedDays:missed,
    day:current||1,expired,hasActivity:!!dates.length,lastWorkoutDate:last,
    unlocked,next,remaining:next?Math.max(0,next.threshold-current):0,
    streakRewards,timeRewards,loadRewards:loads.rewards,exerciseProgress:loads.exercises,
    hasSchedule:true
  }
}
export function newlyUnlocked(before,after){
  const previous=new Set((before?.unlocked||[]).map(r=>r.id))
  return (after?.unlocked||[]).filter(r=>!previous.has(r.id))
}
