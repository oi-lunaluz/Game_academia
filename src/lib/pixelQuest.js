/**
 * Prototipo de aventura: o numero da fase cresce sempre.
 * As fichas seguem sua ordem original, e somente os nomes fazem ciclo.
 * Nada aqui escreve no Supabase.
 */
export function questName(workouts,phase){
  if(!Array.isArray(workouts)||!workouts.length)return 'Crie uma ficha'
  if(!Number.isInteger(phase)||phase<1)throw new RangeError('A fase deve ser positiva')
  return workouts[(phase-1)%workouts.length]
}
export function questPhase(completed, simulated=0){
  return Math.max(0,Math.floor(Number(completed)||0))+
    Math.max(0,Math.floor(Number(simulated)||0))+1
}
export function questChapter(phase,perChapter=5){
  return Math.floor((Math.max(1,phase)-1)/perChapter)
}
export function questWindow(chapter,workouts,completed,simulated=0){
  const active=questPhase(completed,simulated)
  return Array.from({length:5},(_,index)=>{
    const number=chapter*5+index+1
    return {number,name:questName(workouts,number),current:number===active,
      completed:number<active,locked:number>active}
  })
}

/** Mission content is always derived from the saved fichas; the phase number is
 * continuous even when a five-exercise rotation starts over. */
export function questMission(rotation,workouts,number,currentPhase){
 if(!Number.isInteger(number)||number<1)throw new RangeError('Fase inválida')
 const name=questName(rotation,number)
 const sheet=Array.isArray(workouts)?workouts.find(w=>w.name===name):null
 const exercises=Array.isArray(sheet?.exercises)?[...sheet.exercises]:[]
 return {
  number,name,exercises,exerciseCount:exercises.length,
  exists:!!sheet,completed:number<currentPhase,current:number===currentPhase,
  locked:number>currentPhase
 }
}
